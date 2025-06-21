#!/usr/bin/env python3
"""
Setup script for QuantumDocs backend
"""

import os
import secrets
import string

def generate_secret_key(length=32):
    """Generate a secure secret key"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_env_file():
    """Create .env file with secure secret key"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        print("✅ .env file already exists")
        return
    
    secret_key = generate_secret_key()
    env_content = f"SECRET_KEY={secret_key}\n"
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with secure secret key")

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'keys', 'metadata']
    
    for directory in directories:
        dir_path = os.path.join(os.path.dirname(__file__), directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"✅ Directory already exists: {directory}")

def main():
    print("🚀 Setting up QuantumDocs backend...")
    
    create_directories()
    create_env_file()
    
    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Run the server: uvicorn main:app --reload")
    print("3. Open http://localhost:8000/docs to view the API documentation")

if __name__ == "__main__":
    main() 