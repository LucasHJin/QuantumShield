#!/usr/bin/env python3
"""
Test script to debug KEM details issue
"""

import oqs

def test_kem_details():
    """Test how KEM details work"""
    try:
        kem = oqs.KeyEncapsulation("Kyber512")
        print("✅ KEM created successfully")
        
        # Test different ways to get details
        print("\n🔍 Testing KEM details...")
        
        # Method 1: Direct access
        try:
            details = kem.details
            print(f"✅ kem.details (property): {type(details)}")
            print(f"   Keys: {list(details.keys()) if hasattr(details, 'keys') else 'No keys'}")
        except Exception as e:
            print(f"❌ kem.details failed: {e}")
        
        # Method 2: Call as function
        try:
            details = kem.details()
            print(f"✅ kem.details() (function): {type(details)}")
            print(f"   Keys: {list(details.keys()) if hasattr(details, 'keys') else 'No keys'}")
        except Exception as e:
            print(f"❌ kem.details() failed: {e}")
        
        # Method 3: Check if it's callable
        print(f"\n🔍 Is kem.details callable? {callable(kem.details)}")
        
        # Method 4: Try to get length_ciphertext
        try:
            if callable(kem.details):
                details = kem.details()
            else:
                details = kem.details
            
            if isinstance(details, dict) and "length_ciphertext" in details:
                print(f"✅ length_ciphertext: {details['length_ciphertext']}")
            else:
                print(f"❌ length_ciphertext not found in: {details}")
        except Exception as e:
            print(f"❌ Failed to get length_ciphertext: {e}")
            
    except Exception as e:
        print(f"❌ Failed to create KEM: {e}")

if __name__ == "__main__":
    test_kem_details() 