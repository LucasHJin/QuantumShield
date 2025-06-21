import oqs
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os

KEYS_DIR = "keys"
UPLOAD_DIR = "uploads"
os.makedirs(KEYS_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# === Setup PQC algorithms ===
KEM_ALGO = "Kyber512"
SIG_ALGO = "Dilithium2"

# Legacy functions for backward compatibility (using global keys)
def load_or_create_kem_keys():
    pub_path = os.path.join(KEYS_DIR, "kem_public.key")
    sec_path = os.path.join(KEYS_DIR, "kem_secret.key")
    if os.path.exists(pub_path) and os.path.exists(sec_path):
        with open(pub_path, "rb") as f:
            pub = f.read()
        with open(sec_path, "rb") as f:
            sec = f.read()
        return pub, sec
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    pub = kem.generate_keypair()
    sec = kem.export_secret_key()
    with open(pub_path, "wb") as f:
        f.write(pub)
    with open(sec_path, "wb") as f:
        f.write(sec)
    return pub, sec

def load_or_create_sig_keys():
    pub_path = os.path.join(KEYS_DIR, "sig_public.key")
    sec_path = os.path.join(KEYS_DIR, "sig_secret.key")
    if os.path.exists(pub_path) and os.path.exists(sec_path):
        with open(pub_path, "rb") as f:
            pub = f.read()
        with open(sec_path, "rb") as f:
            sec = f.read()
        return pub, sec
    sig = oqs.Signature(SIG_ALGO)
    pub = sig.generate_keypair()
    sec = sig.export_secret_key()
    with open(pub_path, "wb") as f:
        f.write(pub)
    with open(sec_path, "wb") as f:
        f.write(sec)
    return pub, sec

# Load global keys for backward compatibility
receiver_public_key, receiver_secret_key = load_or_create_kem_keys()
sender_public_key, sender_secret_key = load_or_create_sig_keys()

def encrypt_file_logic(data: bytes, file_id: str, user_kem_public_key: bytes = None, user_sig_secret_key: bytes = None):
    """
    Encrypt file with user-specific keys or fall back to global keys
    """
    # Use user keys if provided, otherwise use global keys
    kem_pub_key = user_kem_public_key if user_kem_public_key else receiver_public_key
    sig_sec_key = user_sig_secret_key if user_sig_secret_key else sender_secret_key
    sig_pub_key = sender_public_key  # For now, use global sender public key
    
    # 1) Encapsulate a shared secret to receiver using Kyber
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    ciphertext, shared_secret = kem.encap_secret(kem_pub_key)

    # 2) Use shared secret as AES-GCM key to encrypt the file
    nonce = os.urandom(12)
    aesgcm = AESGCM(shared_secret)
    encrypted_data = aesgcm.encrypt(nonce, data, None)

    # 3) Sign the encrypted data with sender's Dilithium private key
    sig = oqs.Signature(SIG_ALGO, secret_key=sig_sec_key)
    signature = sig.sign(encrypted_data)

    # Prepare response metadata to return to client
    response = {
        "file_id": file_id,
        "encrypted_key": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "signature": base64.b64encode(signature).decode(),
        "sender_public_key": base64.b64encode(sig_pub_key).decode(),
        "download_path": f"/api/download/{file_id}"
    }

    return encrypted_data, response

def decrypt_file_logic(file_id, enc_file, encrypted_key_b64, nonce_b64, signature_b64, sender_pubkey_b64, user_kem_secret_key: bytes = None):
    """
    Decrypt file with user-specific keys or fall back to global keys
    """
    try:
        # Decode base64-encoded strings
        encrypted_key = base64.b64decode(encrypted_key_b64)
        nonce = base64.b64decode(nonce_b64)
        signature = base64.b64decode(signature_b64)
        sender_pubkey = base64.b64decode(sender_pubkey_b64)

        # Use user keys if provided, otherwise use global keys
        kem_sec_key = user_kem_secret_key if user_kem_secret_key else receiver_secret_key

        # 1) Decapsulate shared secret using receiver secret key
        kem = oqs.KeyEncapsulation(KEM_ALGO, secret_key=kem_sec_key)
        shared_secret = kem.decap_secret(encrypted_key)

        # 2) Verify signature on encrypted data using sender public key
        sig = oqs.Signature(SIG_ALGO)
        if not sig.verify(enc_file, signature, sender_pubkey):
            return False, "Invalid signature"

        # 3) Decrypt AES-GCM encrypted file with shared secret
        aesgcm = AESGCM(shared_secret)
        plaintext = aesgcm.decrypt(nonce, enc_file, None)

        # Save decrypted file
        path = os.path.join(UPLOAD_DIR, f"{file_id}.dec")
        with open(path, "wb") as f:
            f.write(plaintext)

        return True, path
    except Exception as e:
        return False, str(e)

# New functions for user-specific encryption/decryption
def encrypt_file_for_user(data: bytes, file_id: str, recipient_kem_public_key: bytes, sender_sig_secret_key: bytes, sender_sig_public_key: bytes):
    """
    Encrypt file specifically for a user using their public key
    """
    # 1) Encapsulate a shared secret to recipient using Kyber
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    ciphertext, shared_secret = kem.encap_secret(recipient_kem_public_key)

    # 2) Use shared secret as AES-GCM key to encrypt the file
    nonce = os.urandom(12)
    aesgcm = AESGCM(shared_secret)
    encrypted_data = aesgcm.encrypt(nonce, data, None)

    # 3) Sign the encrypted data with sender's Dilithium private key
    sig = oqs.Signature(SIG_ALGO, secret_key=sender_sig_secret_key)
    signature = sig.sign(encrypted_data)

    # Prepare response metadata
    response = {
        "file_id": file_id,
        "encrypted_key": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "signature": base64.b64encode(signature).decode(),
        "sender_public_key": base64.b64encode(sender_sig_public_key).decode(),
        "download_path": f"/api/download/{file_id}"
    }

    return encrypted_data, response

def decrypt_file_with_user_key(file_id, enc_file, encrypted_key_b64, nonce_b64, signature_b64, sender_pubkey_b64, user_kem_secret_key: bytes):
    """
    Decrypt file using user's secret key
    """
    try:
        # Decode base64-encoded strings
        encrypted_key = base64.b64decode(encrypted_key_b64)
        nonce = base64.b64decode(nonce_b64)
        signature = base64.b64decode(signature_b64)
        sender_pubkey = base64.b64decode(sender_pubkey_b64)

        # 1) Decapsulate shared secret using user's secret key
        kem = oqs.KeyEncapsulation(KEM_ALGO, secret_key=user_kem_secret_key)
        shared_secret = kem.decap_secret(encrypted_key)

        # 2) Verify signature on encrypted data using sender public key
        sig = oqs.Signature(SIG_ALGO)
        if not sig.verify(enc_file, signature, sender_pubkey):
            return False, "Invalid signature"

        # 3) Decrypt AES-GCM encrypted file with shared secret
        aesgcm = AESGCM(shared_secret)
        plaintext = aesgcm.decrypt(nonce, enc_file, None)

        # Save decrypted file
        path = os.path.join(UPLOAD_DIR, f"{file_id}.dec")
        with open(path, "wb") as f:
            f.write(plaintext)

        return True, path
    except Exception as e:
        return False, str(e)