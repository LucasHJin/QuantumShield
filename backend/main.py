from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import uuid
import os
from pydantic import BaseModel
from typing import List, Optional

# Import our modules
from crypto_utils import encrypt_file_logic, decrypt_file_logic
from file_ops import save_bytes, load_file_bytes
from models import get_db, User, SharedMetadata
from auth import get_current_user, create_access_token, get_password_hash, verify_password
from user_crypto import generate_user_keys, get_user_decryption_keys, encrypt_metadata_for_user, decrypt_metadata_for_user
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="QuantumDocs API", version="1.0.0")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    kem_public_key: str
    sig_public_key: str

class ShareRequest(BaseModel):
    recipient_username: str
    file_id: str
    encrypted_key: str
    nonce: str
    signature: str
    sender_public_key: str

class SharedMetadataResponse(BaseModel):
    id: int
    file_id: str
    sender_username: str
    created_at: str
    is_read: bool

# Authentication endpoints
@app.post("/api/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Generate user keys
    keys = generate_user_keys(user_data.password)
    
    # Create user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        kem_public_key=keys["kem_public_key"],
        kem_secret_key=keys["kem_secret_key"],
        kem_salt=keys["kem_salt"],
        kem_nonce=keys["kem_nonce"],
        sig_public_key=keys["sig_public_key"],
        sig_secret_key=keys["sig_secret_key"],
        sig_salt=keys["sig_salt"],
        sig_nonce=keys["sig_nonce"]
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users", response_model=List[UserResponse])
async def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).all()
    return [
        UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            kem_public_key=user.kem_public_key,
            sig_public_key=user.sig_public_key
        )
        for user in users
    ]

# File encryption endpoint (now requires authentication)
@app.post("/api/encrypt")
async def encrypt_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    file_id = str(uuid.uuid4())
    encrypted_file, response_meta = encrypt_file_logic(contents, file_id)
    save_bytes(f"{file_id}.enc", encrypted_file)
    
    # Add user info to response
    response_meta["user_id"] = current_user.id
    response_meta["username"] = current_user.username
    return response_meta

# File decryption endpoint (now requires authentication)
@app.post("/api/decrypt")
async def decrypt_file(
    file_id: str = Form(...),
    encrypted_key: str = Form(...),
    nonce: str = Form(...),
    signature: str = Form(...),
    sender_public_key: str = Form(...),
    password: str = Form(...),  # User's password to decrypt their keys
    current_user: User = Depends(get_current_user)
):
    try:
        # Get user's decryption keys
        user_kem_secret, user_sig_secret = get_user_decryption_keys(current_user, password)
        
        enc_file = load_file_bytes(f"{file_id}.enc")
        success, output_path_or_error = decrypt_file_logic(
            file_id, enc_file, encrypted_key, nonce, signature, sender_public_key
        )
        if not success:
            return {"error": output_path_or_error}
        return FileResponse(output_path_or_error, filename=f"{file_id}.dec")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Decryption failed: {str(e)}"
        )

# Share file metadata with another user
@app.post("/api/share")
async def share_file(
    share_data: ShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find recipient
    recipient = db.query(User).filter(User.username == share_data.recipient_username).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient user not found"
        )
    
    # Prepare metadata
    metadata = {
        "file_id": share_data.file_id,
        "encrypted_key": share_data.encrypted_key,
        "nonce": share_data.nonce,
        "signature": share_data.signature,
        "sender_public_key": share_data.sender_public_key
    }
    
    # Encrypt metadata for recipient
    encrypted_metadata = encrypt_metadata_for_user(metadata, recipient.kem_public_key)
    
    # Save shared metadata
    shared_meta = SharedMetadata(
        file_id=share_data.file_id,
        encrypted_key=share_data.encrypted_key,
        nonce=share_data.nonce,
        signature=share_data.signature,
        sender_public_key=share_data.sender_public_key,
        sender_id=current_user.id,
        recipient_id=recipient.id,
        encrypted_metadata=encrypted_metadata
    )
    
    db.add(shared_meta)
    db.commit()
    
    return {"message": f"File shared successfully with {recipient.username}"}

# Get shared files for current user
@app.get("/api/shared-with-me", response_model=List[SharedMetadataResponse])
async def get_shared_files(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shared_files = db.query(SharedMetadata).filter(
        SharedMetadata.recipient_id == current_user.id
    ).all()
    
    return [
        SharedMetadataResponse(
            id=share.id,
            file_id=share.file_id,
            sender_username=share.sender.username,
            created_at=share.created_at.isoformat(),
            is_read=share.is_read
        )
        for share in shared_files
    ]

# Decrypt shared metadata
@app.post("/api/decrypt-shared/{share_id}")
async def decrypt_shared_metadata(
    share_id: int,
    password: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get shared metadata
    shared_meta = db.query(SharedMetadata).filter(
        SharedMetadata.id == share_id,
        SharedMetadata.recipient_id == current_user.id
    ).first()
    
    if not shared_meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared metadata not found"
        )
    
    try:
        # Get user's decryption keys
        user_kem_secret, _ = get_user_decryption_keys(current_user, password)
        
        # Decrypt metadata
        metadata = decrypt_metadata_for_user(shared_meta.encrypted_metadata, user_kem_secret)
        
        # Mark as read
        shared_meta.is_read = True
        db.commit()
        
        return metadata
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to decrypt shared metadata: {str(e)}"
        )

@app.get("/api/download/{file_id}")
async def download_encrypted_file(file_id: str):
    path = os.path.join(UPLOAD_DIR, f"{file_id}.enc")
    if not os.path.exists(path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    return FileResponse(path, media_type="application/octet-stream")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
