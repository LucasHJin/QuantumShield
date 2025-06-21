#!/usr/bin/env python3
"""
Test script to verify metadata encryption/decryption
"""

import oqs
import base64
import os
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def test_metadata_encryption_decryption():
    """Test the complete metadata encryption/decryption process"""
    
    # Test data
    test_metadata = {
        "file_id": "test-123",
        "encrypted_key": "test-key",
        "nonce": "test-nonce",
        "signature": "test-signature",
        "sender_public_key": "test-sender-key"
    }
    
    print("🧪 Testing metadata encryption/decryption...")
    
    # Generate recipient keys - use the same KEM instance
    kem = oqs.KeyEncapsulation("Kyber512")
    recipient_public_key = kem.generate_keypair()
    recipient_secret_key = kem.export_secret_key()
    
    print(f"✅ Generated recipient keys - Public: {len(recipient_public_key)}, Secret: {len(recipient_secret_key)}")
    
    # Encrypt metadata
    print("\n🔐 Encrypting metadata...")
    
    # Convert metadata to bytes
    metadata_bytes = json.dumps(test_metadata).encode()
    print(f"   Metadata JSON length: {len(metadata_bytes)}")
    
    # Generate a random AES key
    aes_key = os.urandom(32)
    nonce = os.urandom(12)
    print(f"   Generated AES key: {len(aes_key)}, nonce: {len(nonce)}")
    
    # Encrypt metadata with AES
    aesgcm = AESGCM(aes_key)
    encrypted_metadata = aesgcm.encrypt(nonce, metadata_bytes, None)
    print(f"   Encrypted metadata length: {len(encrypted_metadata)}")
    
    # Encrypt AES key with recipient's public key using KEM
    # Use a NEW KEM instance for encapsulation
    kem_encrypt = oqs.KeyEncapsulation("Kyber512")
    encrypted_aes_key, _ = kem_encrypt.encap_secret(recipient_public_key)
    print(f"   Encrypted AES key length: {len(encrypted_aes_key)}")
    
    # Combine encrypted AES key and encrypted metadata
    combined = encrypted_aes_key + nonce + encrypted_metadata
    combined_b64 = base64.b64encode(combined).decode()
    print(f"   Combined length: {len(combined)}, Base64 length: {len(combined_b64)}")
    
    # Decrypt metadata
    print("\n🔓 Decrypting metadata...")
    
    # Decode combined data
    combined_decoded = base64.b64decode(combined_b64)
    print(f"   Decoded combined length: {len(combined_decoded)}")
    
    # Get KEM details
    kem_details = oqs.KeyEncapsulation("Kyber512").details
    encrypted_aes_key_size = kem_details["length_ciphertext"]
    print(f"   KEM ciphertext length: {encrypted_aes_key_size}")
    
    # Extract components
    extracted_aes_key = combined_decoded[:encrypted_aes_key_size]
    extracted_nonce = combined_decoded[encrypted_aes_key_size:encrypted_aes_key_size + 12]
    extracted_metadata = combined_decoded[encrypted_aes_key_size + 12:]
    
    print(f"   Extracted - AES key: {len(extracted_aes_key)}, nonce: {len(extracted_nonce)}, metadata: {len(extracted_metadata)}")
    
    # Verify extracted components match original
    print(f"   AES key matches: {extracted_aes_key == encrypted_aes_key}")
    print(f"   Nonce matches: {extracted_nonce == nonce}")
    print(f"   Metadata matches: {extracted_metadata == encrypted_metadata}")
    
    # Decapsulate AES key - use a NEW KEM instance with the secret key
    kem_decrypt = oqs.KeyEncapsulation("Kyber512", secret_key=recipient_secret_key)
    decapsulated_aes_key = kem_decrypt.decap_secret(extracted_aes_key)
    print(f"   Decapsulated AES key length: {len(decapsulated_aes_key)}")
    print(f"   AES key matches: {decapsulated_aes_key == aes_key}")
    
    # Decrypt metadata
    aesgcm_decrypt = AESGCM(decapsulated_aes_key)
    decrypted_metadata_bytes = aesgcm_decrypt.decrypt(extracted_nonce, extracted_metadata, None)
    print(f"   Decrypted metadata length: {len(decrypted_metadata_bytes)}")
    
    # Parse JSON
    decrypted_metadata = json.loads(decrypted_metadata_bytes.decode())
    print(f"   Decrypted metadata: {decrypted_metadata}")
    print(f"   Metadata matches: {decrypted_metadata == test_metadata}")
    
    if decrypted_metadata == test_metadata:
        print("\n✅ SUCCESS: Encryption/decryption works correctly!")
    else:
        print("\n❌ FAILED: Encryption/decryption failed!")

if __name__ == "__main__":
    test_metadata_encryption_decryption() 