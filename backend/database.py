from sqlalchemy.orm import Session
from models import SessionLocal, User as UserModel, SharedMetadata as SharedMetadataModel
from typing import Optional, List
import os

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# User model
class User:
    def __init__(self, username: str, email: str, password_hash: str, id: Optional[int] = None):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.id = id

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash
        }

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            username=data["username"],
            email=data["email"],
            password_hash=data["password_hash"],
            id=data.get("id")
        )

# File model
class FileRecord:
    def __init__(self, file_id: str, filename: str, sender_username: str, 
                 recipient_username: str, encrypted_data: bytes, ciphertext: bytes,
                 signature: bytes, nonce: bytes, sender_public_key: bytes, id: Optional[int] = None):
        self.file_id = file_id
        self.filename = filename
        self.sender_username = sender_username
        self.recipient_username = recipient_username
        self.encrypted_data = encrypted_data
        self.ciphertext = ciphertext
        self.signature = signature
        self.nonce = nonce
        self.sender_public_key = sender_public_key
        self.id = id

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
            sender_public_key=data["sender_public_key"],
            id=data.get("id")
        )

# Database operations
async def find_user_by_email(db: Session, email: str) -> Optional[User]:
    """Find user by email"""
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user:
        return User(
            username=user.username,
            email=user.email,
            password_hash=user.hashed_password,
            id=user.id
        )
    return None

async def find_user_by_username(db: Session, username: str) -> Optional[User]:
    """Find user by username"""
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user:
        return User(
            username=user.username,
            email=user.email,
            password_hash=user.hashed_password,
            id=user.id
        )
    return None

async def create_user(db: Session, user: User) -> User:
    """Create a new user"""
    db_user = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=user.password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return User(
        username=db_user.username,
        email=db_user.email,
        password_hash=db_user.hashed_password,
        id=db_user.id
    )

async def get_all_users(db: Session, exclude_username: str = None) -> List[User]:
    """Get all users, optionally excluding one"""
    query = db.query(UserModel)
    if exclude_username:
        query = query.filter(UserModel.username != exclude_username)
    users = query.all()
    return [
        User(
            username=user.username,
            email=user.email,
            password_hash=user.hashed_password,
            id=user.id
        ) for user in users
    ]

async def create_file_record(db: Session, file_record: FileRecord) -> FileRecord:
    """Create a new file record"""
    # For now, we'll store file records in the SharedMetadata table
    # This is a simplified approach - you might want to create a separate Files table
    sender = db.query(UserModel).filter(UserModel.username == file_record.sender_username).first()
    recipient = db.query(UserModel).filter(UserModel.username == file_record.recipient_username).first()
    
    if not sender or not recipient:
        raise ValueError("Sender or recipient not found")
    
    shared_metadata = SharedMetadataModel(
        file_id=file_record.file_id,
        encrypted_key=file_record.ciphertext.decode('utf-8') if isinstance(file_record.ciphertext, bytes) else str(file_record.ciphertext),
        nonce=file_record.nonce.decode('utf-8') if isinstance(file_record.nonce, bytes) else str(file_record.nonce),
        signature=file_record.signature.decode('utf-8') if isinstance(file_record.signature, bytes) else str(file_record.signature),
        sender_public_key=file_record.sender_public_key.decode('utf-8') if isinstance(file_record.sender_public_key, bytes) else str(file_record.sender_public_key),
        sender_id=sender.id,
        recipient_id=recipient.id,
        encrypted_metadata=file_record.filename  # Store filename as metadata for now
    )
    
    db.add(shared_metadata)
    db.commit()
    db.refresh(shared_metadata)
    
    return FileRecord(
        file_id=shared_metadata.file_id,
        filename=shared_metadata.encrypted_metadata,
        sender_username=file_record.sender_username,
        recipient_username=file_record.recipient_username,
        encrypted_data=file_record.encrypted_data,
        ciphertext=file_record.ciphertext,
        signature=file_record.signature,
        nonce=file_record.nonce,
        sender_public_key=file_record.sender_public_key,
        id=shared_metadata.id
    )

async def find_file_by_id(db: Session, file_id: str) -> Optional[FileRecord]:
    """Find file record by file_id"""
    shared_metadata = db.query(SharedMetadataModel).filter(SharedMetadataModel.file_id == file_id).first()
    if shared_metadata:
        sender = db.query(UserModel).filter(UserModel.id == shared_metadata.sender_id).first()
        recipient = db.query(UserModel).filter(UserModel.id == shared_metadata.recipient_id).first()
        
        return FileRecord(
            file_id=shared_metadata.file_id,
            filename=shared_metadata.encrypted_metadata,
            sender_username=sender.username if sender else "",
            recipient_username=recipient.username if recipient else "",
            encrypted_data=b"",  # This would need to be stored separately or in a different table
            ciphertext=shared_metadata.encrypted_key.encode('utf-8') if isinstance(shared_metadata.encrypted_key, str) else shared_metadata.encrypted_key,
            signature=shared_metadata.signature.encode('utf-8') if isinstance(shared_metadata.signature, str) else shared_metadata.signature,
            nonce=shared_metadata.nonce.encode('utf-8') if isinstance(shared_metadata.nonce, str) else shared_metadata.nonce,
            sender_public_key=shared_metadata.sender_public_key.encode('utf-8') if isinstance(shared_metadata.sender_public_key, str) else shared_metadata.sender_public_key,
            id=shared_metadata.id
        )
    return None

async def get_received_files(db: Session, username: str) -> List[FileRecord]:
    """Get files received by a user"""
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        return []
    
    shared_metadata_list = db.query(SharedMetadataModel).filter(SharedMetadataModel.recipient_id == user.id).all()
    files = []
    
    for shared_metadata in shared_metadata_list:
        sender = db.query(UserModel).filter(UserModel.id == shared_metadata.sender_id).first()
        recipient = db.query(UserModel).filter(UserModel.id == shared_metadata.recipient_id).first()
        
        files.append(FileRecord(
            file_id=shared_metadata.file_id,
            filename=shared_metadata.encrypted_metadata,
            sender_username=sender.username if sender else "",
            recipient_username=recipient.username if recipient else "",
            encrypted_data=b"",  # This would need to be stored separately
            ciphertext=shared_metadata.encrypted_key.encode('utf-8') if isinstance(shared_metadata.encrypted_key, str) else shared_metadata.encrypted_key,
            signature=shared_metadata.signature.encode('utf-8') if isinstance(shared_metadata.signature, str) else shared_metadata.signature,
            nonce=shared_metadata.nonce.encode('utf-8') if isinstance(shared_metadata.nonce, str) else shared_metadata.nonce,
            sender_public_key=shared_metadata.sender_public_key.encode('utf-8') if isinstance(shared_metadata.sender_public_key, str) else shared_metadata.sender_public_key,
            id=shared_metadata.id
        ))
    
    return files

async def get_sent_files(db: Session, username: str) -> List[FileRecord]:
    """Get files sent by a user"""
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        return []
    
    shared_metadata_list = db.query(SharedMetadataModel).filter(SharedMetadataModel.sender_id == user.id).all()
    files = []
    
    for shared_metadata in shared_metadata_list:
        sender = db.query(UserModel).filter(UserModel.id == shared_metadata.sender_id).first()
        recipient = db.query(UserModel).filter(UserModel.id == shared_metadata.recipient_id).first()
        
        files.append(FileRecord(
            file_id=shared_metadata.file_id,
            filename=shared_metadata.encrypted_metadata,
            sender_username=sender.username if sender else "",
            recipient_username=recipient.username if recipient else "",
            encrypted_data=b"",  # This would need to be stored separately
            ciphertext=shared_metadata.encrypted_key.encode('utf-8') if isinstance(shared_metadata.encrypted_key, str) else shared_metadata.encrypted_key,
            signature=shared_metadata.signature.encode('utf-8') if isinstance(shared_metadata.signature, str) else shared_metadata.signature,
            nonce=shared_metadata.nonce.encode('utf-8') if isinstance(shared_metadata.nonce, str) else shared_metadata.nonce,
            sender_public_key=shared_metadata.sender_public_key.encode('utf-8') if isinstance(shared_metadata.sender_public_key, str) else shared_metadata.sender_public_key,
            id=shared_metadata.id
        ))
    
    return files

async def health_check(db: Session) -> bool:
    """Check database health"""
    try:
        # Try to query the database
        db.query(UserModel).first()
        return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False 