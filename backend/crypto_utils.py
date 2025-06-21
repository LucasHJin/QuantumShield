import oqs
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os
from typing import Tuple, Optional

# === PQC Algorithm Configuration ===
KEM_ALGO = "Kyber512"
SIG_ALGO = "Dilithium2"

def encrypt_file_for_user(data: bytes, recipient_kyber_public: bytes, 
                         sender_dilithium_private: bytes) -> Tuple[bytes, bytes, bytes, bytes]:
    """
    Encrypt a file for a specific recipient using their Kyber public key.
    Sign the encrypted data using the sender's Dilithium private key.
    
    Returns: (encrypted_data, ciphertext, signature, nonce)
    """
    # 1) Encapsulate a shared secret to recipient using their Kyber public key
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    ciphertext, shared_secret = kem.encap_secret(recipient_kyber_public)

    # 2) Use shared secret as AES-GCM key to encrypt the file
    nonce = os.urandom(12)
    aesgcm = AESGCM(shared_secret)
    encrypted_data = aesgcm.encrypt(nonce, data, None)

    # 3) Sign the encrypted data with sender's Dilithium private key
    sig = oqs.Signature(SIG_ALGO, secret_key=sender_dilithium_private)
    signature = sig.sign(encrypted_data)

    return encrypted_data, ciphertext, signature, nonce

def decrypt_file_for_user(encrypted_data: bytes, ciphertext: bytes, 
                         signature: bytes, nonce: bytes, sender_dilithium_public: bytes,
                         recipient_kyber_private: bytes) -> Optional[bytes]:
    """
    Decrypt a file using the recipient's Kyber private key.
    Verify the signature using the sender's Dilithium public key.
    
    Returns: decrypted_data if successful, None if verification fails
    """
    try:
        # 1) Decapsulate shared secret using recipient's Kyber private key
        kem = oqs.KeyEncapsulation(KEM_ALGO, secret_key=recipient_kyber_private)
        shared_secret = kem.decap_secret(ciphertext)

        # 2) Verify signature on encrypted data using sender's Dilithium public key
        sig = oqs.Signature(SIG_ALGO)
        if not sig.verify(encrypted_data, signature, sender_dilithium_public):
            return None

        # 3) Decrypt AES-GCM encrypted file with shared secret
        aesgcm = AESGCM(shared_secret)
        plaintext = aesgcm.decrypt(nonce, encrypted_data, None)

        return plaintext
    except Exception as e:
        print(f"Decryption error: {e}")
        return None

def encode_metadata(ciphertext: bytes, signature: bytes, nonce: bytes, 
                   sender_public_key: bytes) -> dict:
    """Encode binary data to base64 for JSON transmission"""
    return {
        "ciphertext": base64.b64encode(ciphertext).decode(),
        "signature": base64.b64encode(signature).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "sender_public_key": base64.b64encode(sender_public_key).decode()
    }

def decode_metadata(metadata: dict) -> Tuple[bytes, bytes, bytes, bytes]:
    """Decode base64 strings back to binary data"""
    return (
        base64.b64decode(metadata["ciphertext"]),
        base64.b64decode(metadata["signature"]),
        base64.b64decode(metadata["nonce"]),
        base64.b64decode(metadata["sender_public_key"])
    )