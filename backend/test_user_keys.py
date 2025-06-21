#!/usr/bin/env python3
"""
Test user key retrieval and usage
"""

import oqs
import base64
import os
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

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

def test_user_key_workflow():
    """Test the complete user key workflow"""
    
    print("🧪 Testing user key workflow...")
    
    # Simulate user registration
    password = "testpassword123"
    
    # Generate user keys
    kem = oqs.KeyEncapsulation("Kyber512")
    kem_pub = kem.generate_keypair()
    kem_sec = kem.export_secret_key()
    
    print(f"✅ Generated user keys - Public: {len(kem_pub)}, Secret: {len(kem_sec)}")
    
    # Encrypt user's secret key with password
    kem_encrypted, kem_salt, kem_nonce = encrypt_user_keys(kem_sec, password)
    print(f"✅ Encrypted user secret key")
    
    # Simulate user login - decrypt the secret key
    decrypted_kem_sec = decrypt_user_keys(kem_encrypted, kem_salt, kem_nonce, password)
    print(f"✅ Decrypted user secret key: {len(decrypted_kem_sec)}")
    
    # Verify the decrypted key matches the original
    if decrypted_kem_sec == kem_sec:
        print("✅ SUCCESS: User secret key decryption works!")
    else:
        print("❌ FAILED: User secret key decryption failed!")
        print(f"   Original key length: {len(kem_sec)}")
        print(f"   Decrypted key length: {len(decrypted_kem_sec)}")
        print(f"   First 10 bytes original: {kem_sec[:10]}")
        print(f"   First 10 bytes decrypted: {decrypted_kem_sec[:10]}")
        return False
    
    # Now test metadata encryption/decryption with the user's keys
    print("\n🔐 Testing metadata encryption with user keys...")
    
    # Test metadata
    test_metadata = {
        "file_id": "test-123",
        "encrypted_key": "test-key",
        "nonce": "test-nonce",
        "signature": "test-signature",
        "sender_public_key": "test-sender-key"
    }
    
    # Encrypt metadata for this user
    metadata_bytes = json.dumps(test_metadata).encode()
    aes_key = os.urandom(32)
    nonce = os.urandom(12)
    
    aesgcm = AESGCM(aes_key)
    encrypted_metadata = aesgcm.encrypt(nonce, metadata_bytes, None)
    
    # Encrypt AES key with user's public key
    kem_encap = oqs.KeyEncapsulation("Kyber512")
    encrypted_aes_key, _ = kem_encap.encap_secret(kem_pub)
    
    # Combine
    combined = encrypted_aes_key + nonce + encrypted_metadata
    combined_b64 = base64.b64encode(combined).decode()
    
    print(f"✅ Encrypted metadata for user")
    
    # Decrypt metadata using user's secret key
    print("\n🔓 Decrypting metadata with user keys...")
    
    combined_decoded = base64.b64decode(combined_b64)
    kem_details = oqs.KeyEncapsulation("Kyber512").details
    encrypted_aes_key_size = kem_details["length_ciphertext"]
    
    extracted_aes_key = combined_decoded[:encrypted_aes_key_size]
    extracted_nonce = combined_decoded[encrypted_aes_key_size:encrypted_aes_key_size + 12]
    extracted_metadata = combined_decoded[encrypted_aes_key_size + 12:]
    
    # Decapsulate using user's decrypted secret key
    kem_decap = oqs.KeyEncapsulation("Kyber512", secret_key=decrypted_kem_sec)
    decapsulated_aes_key = kem_decap.decap_secret(extracted_aes_key)
    
    print(f"   Decapsulated AES key length: {len(decapsulated_aes_key)}")
    print(f"   AES key matches: {decapsulated_aes_key == aes_key}")
    
    if decapsulated_aes_key != aes_key:
        print("❌ FAILED: AES key decapsulation failed!")
        return False
    
    # Decrypt metadata
    aesgcm_decrypt = AESGCM(decapsulated_aes_key)
    decrypted_metadata_bytes = aesgcm_decrypt.decrypt(extracted_nonce, extracted_metadata, None)
    
    # Parse JSON
    decrypted_metadata = json.loads(decrypted_metadata_bytes.decode())
    
    if decrypted_metadata == test_metadata:
        print("✅ SUCCESS: Complete user key workflow works!")
        return True
    else:
        print("❌ FAILED: Metadata decryption failed!")
        return False

if __name__ == "__main__":
    test_user_key_workflow() 