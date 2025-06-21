from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Create database
DATABASE_URL = "sqlite:///./quantumdocs.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    kem_public_key = Column(Text)  # Base64 encoded
    kem_secret_key = Column(Text)  # Base64 encoded, encrypted with user's password
    kem_salt = Column(Text)  # Base64 encoded salt for KEM key encryption
    kem_nonce = Column(Text)  # Base64 encoded nonce for KEM key encryption
    sig_public_key = Column(Text)  # Base64 encoded
    sig_secret_key = Column(Text)  # Base64 encoded, encrypted with user's password
    sig_salt = Column(Text)  # Base64 encoded salt for signature key encryption
    sig_nonce = Column(Text)  # Base64 encoded nonce for signature key encryption
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sent_shares = relationship("SharedMetadata", foreign_keys="SharedMetadata.sender_id", back_populates="sender")
    received_shares = relationship("SharedMetadata", foreign_keys="SharedMetadata.recipient_id", back_populates="recipient")

class SharedMetadata(Base):
    __tablename__ = "shared_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, index=True)
    encrypted_key = Column(Text)  # Base64 encoded
    nonce = Column(Text)  # Base64 encoded
    signature = Column(Text)  # Base64 encoded
    sender_public_key = Column(Text)  # Base64 encoded
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"))
    encrypted_metadata = Column(Text)  # Metadata encrypted with recipient's public key
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_shares")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_shares")

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 