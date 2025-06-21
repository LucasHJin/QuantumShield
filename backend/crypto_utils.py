import oqs
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import os
import ctypes

UPLOAD_DIR = "uploads"

# PQC key setup
receiver_kem = oqs.KeyEncapsulation("Kyber512")
receiver_public_key = receiver_kem.generate_keypair()
receiver_secret_key = receiver_kem.export_secret_key()

sender_sig = oqs.Signature("Dilithium2")
sender_public_key = sender_sig.generate_keypair()
sender_secret_key = sender_sig.export_secret_key()


def encrypt_file_logic(data: bytes, file_id: str):
    # Symmetric encryption (AES-GCM)
    aes_key = os.urandom(32)
    nonce = os.urandom(12)
    aesgcm = AESGCM(aes_key)
    encrypted = aesgcm.encrypt(nonce, data, None)

    # KEM: derive AES key securely
    kem = oqs.KeyEncapsulation("Kyber512")
    # Restore secret key correctly
    ctypes.memmove(kem.secret_key, receiver_secret_key, len(receiver_secret_key))
    ciphertext, shared_secret = kem.encap(receiver_public_key)

    # Sign encrypted content
    sig = oqs.Signature("Dilithium2")
    sig.import_secret_key(sender_secret_key)
    signature = sig.sign(encrypted)

    response = {
        "file_id": file_id,
        "encrypted_key": base64.b64encode(ciphertext).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "signature": base64.b64encode(signature).decode(),
        "sender_public_key": base64.b64encode(sender_public_key).decode(),
        "download_path": f"/api/download/{file_id}"
    }

    return encrypted, response


def decrypt_file_logic(file_id, enc_file, encrypted_key, nonce, signature, sender_pubkey_b64):
    try:
        # KEM: recover AES key
        kem = oqs.KeyEncapsulation("Kyber512")
        ctypes.memmove(kem.secret_key, receiver_secret_key, len(receiver_secret_key))
        aes_key = kem.decap(base64.b64decode(encrypted_key))

        # Verify signature
        sig = oqs.Signature("Dilithium2")
        sender_pubkey = base64.b64decode(sender_pubkey_b64)
        sig.import_public_key(sender_pubkey)
        if not sig.verify(enc_file, base64.b64decode(signature), sender_pubkey):
            return False, "Invalid signature"

        # AES decryption
        aesgcm = AESGCM(aes_key)
        plaintext = aesgcm.decrypt(base64.b64decode(nonce), enc_file, None)

        path = os.path.join(UPLOAD_DIR, f"{file_id}.dec")
        with open(path, "wb") as f:
            f.write(plaintext)

        return True, path
    except Exception as e:
        return False, str(e)
