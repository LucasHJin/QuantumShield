#!/usr/bin/env python3
"""
Simple KEM test to isolate the issue
"""

import oqs
import base64

def test_kem_simple():
    """Test basic KEM encapsulation/decapsulation"""
    
    print("🧪 Testing basic KEM encapsulation/decapsulation...")
    
    # Create KEM instance and generate keypair
    kem = oqs.KeyEncapsulation("Kyber512")
    public_key = kem.generate_keypair()
    secret_key = kem.export_secret_key()
    
    print(f"✅ Generated keys - Public: {len(public_key)}, Secret: {len(secret_key)}")
    
    # Encapsulate a secret
    kem_encap = oqs.KeyEncapsulation("Kyber512")
    ciphertext, shared_secret_encap = kem_encap.encap_secret(public_key)
    
    print(f"✅ Encapsulated - Ciphertext: {len(ciphertext)}, Shared secret: {len(shared_secret_encap)}")
    
    # Decapsulate the secret
    kem_decap = oqs.KeyEncapsulation("Kyber512", secret_key=secret_key)
    shared_secret_decap = kem_decap.decap_secret(ciphertext)
    
    print(f"✅ Decapsulated - Shared secret: {len(shared_secret_decap)}")
    
    # Compare the shared secrets
    if shared_secret_encap == shared_secret_decap:
        print("✅ SUCCESS: Shared secrets match!")
        return True
    else:
        print("❌ FAILED: Shared secrets don't match!")
        print(f"   Encapsulated: {shared_secret_encap[:10]}...")
        print(f"   Decapsulated: {shared_secret_decap[:10]}...")
        return False

if __name__ == "__main__":
    test_kem_simple() 