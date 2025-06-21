import oqs
import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from models import User
from sqlalchemy.orm import Session

# PQC algorithms
KEM_ALGO = "Kyber512"
SIG_ALGO = "Dilithium2"

def derive_key_from_password(password: str, salt: bytes = None) -> tuple:
    """Derive a key from password using PBKDF2"""
    if salt is None:
        salt = os.urandom(16)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = kdf.derive(password.encode())
    return key, salt

def encrypt_user_keys(keys_data: bytes, password: str) -> tuple:
    """Encrypt user's private keys with their password"""
    key, salt = derive_key_from_password(password)
    nonce = os.urandom(12)
    aesgcm = AESGCM(key)
    encrypted_keys = aesgcm.encrypt(nonce, keys_data, None)
    return base64.b64encode(encrypted_keys).decode(), base64.b64encode(salt).decode(), base64.b64encode(nonce).decode()

def decrypt_user_keys(encrypted_keys_b64: str, salt_b64: str, nonce_b64: str, password: str) -> bytes:
    """Decrypt user's private keys with their password"""
    encrypted_keys = base64.b64decode(encrypted_keys_b64)
    salt = base64.b64decode(salt_b64)
    nonce = base64.b64decode(nonce_b64)
    
    key, _ = derive_key_from_password(password, salt)
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, encrypted_keys, None)

def generate_user_keys(password: str) -> dict:
    """Generate KEM and signature keys for a new user"""
    # Generate KEM keys
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    kem_pub = kem.generate_keypair()
    kem_sec = kem.export_secret_key()
    
    # Generate signature keys
    sig = oqs.Signature(SIG_ALGO)
    sig_pub = sig.generate_keypair()
    sig_sec = sig.export_secret_key()
    
    # Encrypt private keys with user's password
    kem_encrypted, kem_salt, kem_nonce = encrypt_user_keys(kem_sec, password)
    sig_encrypted, sig_salt, sig_nonce = encrypt_user_keys(sig_sec, password)
    
    return {
        "kem_public_key": base64.b64encode(kem_pub).decode(),
        "kem_secret_key": kem_encrypted,
        "kem_salt": kem_salt,
        "kem_nonce": kem_nonce,
        "sig_public_key": base64.b64encode(sig_pub).decode(),
        "sig_secret_key": sig_encrypted,
        "sig_salt": sig_salt,
        "sig_nonce": sig_nonce
    }

def get_user_decryption_keys(user: User, password: str) -> tuple:
    """Get user's decryption keys for file operations"""
    # Decrypt KEM secret key
    kem_secret = decrypt_user_keys(
        user.kem_secret_key, 
        user.kem_salt, 
        user.kem_nonce, 
        password
    )
    
    # Decrypt signature secret key
    sig_secret = decrypt_user_keys(
        user.sig_secret_key, 
        user.sig_salt, 
        user.sig_nonce, 
        password
    )
    
    return kem_secret, sig_secret

def encrypt_metadata_for_user(metadata: dict, recipient_public_key: str) -> str:
    """Encrypt metadata with recipient's public key for secure sharing"""
    # Convert metadata to bytes
    import json
    metadata_bytes = json.dumps(metadata).encode()
    
    # Generate a random AES key
    aes_key = os.urandom(32)
    nonce = os.urandom(12)
    
    # Encrypt metadata with AES
    aesgcm = AESGCM(aes_key)
    encrypted_metadata = aesgcm.encrypt(nonce, metadata_bytes, None)
    
    # Encrypt AES key with recipient's public key using KEM
    kem = oqs.KeyEncapsulation(KEM_ALGO)
    recipient_pub = base64.b64decode(recipient_public_key)
    encrypted_aes_key, _ = kem.encap_secret(recipient_pub)
    
    # Combine encrypted AES key and encrypted metadata
    combined = encrypted_aes_key + nonce + encrypted_metadata
    return base64.b64encode(combined).decode()

def decrypt_metadata_for_user(encrypted_metadata: str, user_kem_secret: bytes) -> dict:
    """Decrypt metadata using user's secret key"""
    try:
        print(f"🔍 Debug: Starting decryption of metadata length: {len(encrypted_metadata)}")
        
        combined = base64.b64decode(encrypted_metadata)
        print(f"🔍 Debug: Decoded combined length: {len(combined)}")
        
        # Get KEM details to determine ciphertext length
        kem = oqs.KeyEncapsulation(KEM_ALGO)
        kem_details = kem.details  # Access as property, not function
        encrypted_aes_key_size = kem_details["length_ciphertext"]
        print(f"🔍 Debug: KEM ciphertext length: {encrypted_aes_key_size}")
        
        # Extract components
        encrypted_aes_key = combined[:encrypted_aes_key_size]
        nonce = combined[encrypted_aes_key_size:encrypted_aes_key_size + 12]
        encrypted_metadata_with_tag = combined[encrypted_aes_key_size + 12:]
        
        print(f"🔍 Debug: Extracted - AES key: {len(encrypted_aes_key)}, nonce: {len(nonce)}, metadata+tag: {len(encrypted_metadata_with_tag)}")
        
        # Decapsulate AES key
        kem_with_secret = oqs.KeyEncapsulation(KEM_ALGO, secret_key=user_kem_secret)
        aes_key = kem_with_secret.decap_secret(encrypted_aes_key)
        print(f"🔍 Debug: Decapsulated AES key length: {len(aes_key)}")
        
        # Decrypt metadata (encrypted_metadata_with_tag includes the 16-byte authentication tag)
        aesgcm = AESGCM(aes_key)
        metadata_bytes = aesgcm.decrypt(nonce, encrypted_metadata_with_tag, None)
        print(f"🔍 Debug: Decrypted metadata length: {len(metadata_bytes)}")
        
        import json
        result = json.loads(metadata_bytes.decode())
        print(f"🔍 Debug: Successfully parsed JSON metadata")
        return result
        
    except Exception as e:
        import traceback
        print(f"❌ Debug: Full error traceback:")
        traceback.print_exc()
        raise ValueError(f"Failed to decrypt metadata: {str(e)}") 