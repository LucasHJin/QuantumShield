from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import os

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "secure_file_transfer")

# Database client
client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
users_collection = database.users
files_collection = database.files

# User model
class User:
    def __init__(self, username: str, password_hash: str):
        self.username = username
        self.password_hash = password_hash

    def to_dict(self):
        return {
            "username": self.username,
            "password_hash": self.password_hash
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            username=data["username"],
            password_hash=data["password_hash"]
        )

# File model
class FileRecord:
    def __init__(self, file_id: str, filename: str, sender_username: str, 
                 recipient_username: str, encrypted_data: bytes, ciphertext: bytes,
                 signature: bytes, nonce: bytes, sender_public_key: bytes):
        self.file_id = file_id
        self.filename = filename
        self.sender_username = sender_username
        self.recipient_username = recipient_username
        self.encrypted_data = encrypted_data
        self.ciphertext = ciphertext
        self.signature = signature
        self.nonce = nonce
        self.sender_public_key = sender_public_key

    def to_dict(self):
        return {
            "file_id": self.file_id,
            "filename": self.filename,
            "sender_username": self.sender_username,
            "recipient_username": self.recipient_username,
            "encrypted_data": self.encrypted_data,
            "ciphertext": self.ciphertext,
            "signature": self.signature,
            "nonce": self.nonce,
            "sender_public_key": self.sender_public_key
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            file_id=data["file_id"],
            filename=data["filename"],
            sender_username=data["sender_username"],
            recipient_username=data["recipient_username"],
            encrypted_data=data["encrypted_data"],
            ciphertext=data["ciphertext"],
            signature=data["signature"],
            nonce=data["nonce"],
            sender_public_key=data["sender_public_key"]
        ) 