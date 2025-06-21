from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid
import os
from typing import List, Optional
import tempfile

from database import users_collection, files_collection, User, FileRecord
from auth import get_password_hash, verify_password, create_access_token, verify_token
from crypto_utils import (
    encrypt_file_for_user, 
    decrypt_file_for_user,
    encode_metadata,
    decode_metadata
)

app = FastAPI(title="Secure File Transfer System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Temporary directory for file operations
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)

# File validation
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".zip", ".rar"}
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "100")) * 1024 * 1024  # 100MB default

def is_file_allowed(filename: str) -> bool:
    if not filename:
        return False
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    username = verify_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_data = await users_collection.find_one({"username": username})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return User.from_dict(user_data)

# Test endpoint
@app.get("/api/test")
async def test_endpoint():
    return {"message": "Backend is working!", "status": "ok"}

# User registration
@app.post("/api/register")
async def register_user(username: str = Form(...), password: str = Form(...)):
    try:
        print(f"Registration attempt for username: {username}")
        print(f"Password length: {len(password)}")
        
        # Validate input
        if len(username) < 3:
            print(f"Username too short: {len(username)} characters")
            raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
        
        if len(password) < 6:
            print(f"Password too short: {len(password)} characters")
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        print("Input validation passed")
        
        # Check if user already exists
        print("Checking if user exists...")
        existing_user = await users_collection.find_one({"username": username})
        if existing_user:
            print(f"User {username} already exists")
            raise HTTPException(status_code=400, detail="Username already registered")
        
        print("User does not exist, proceeding with creation")
        
        # Hash password
        print("Hashing password...")
        password_hash = get_password_hash(password)
        print("Password hashed successfully")
        
        # Create user
        user = User(
            username=username,
            password_hash=password_hash
        )
        print("User object created")
        
        # Save to database
        print("Saving to database...")
        result = await users_collection.insert_one(user.to_dict())
        print(f"User created with ID: {result.inserted_id}")
        
        return {"message": "User registered successfully", "username": username}
        
    except HTTPException:
        print("HTTPException raised, re-raising")
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# User login
@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    try:
        print(f"Login attempt for username: {username}")
        print(f"Password length: {len(password)}")
        
        # Find user
        print("Looking up user in database...")
        user_data = await users_collection.find_one({"username": username})
        if not user_data:
            print(f"User {username} not found in database")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print(f"User found: {user_data}")
        user = User.from_dict(user_data)
        print(f"User object created from data")
        
        # Verify password
        print("Verifying password...")
        print(f"Stored password hash: {user.password_hash}")
        is_valid = verify_password(password, user.password_hash)
        print(f"Password verification result: {is_valid}")
        
        if not is_valid:
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        print("Password verified successfully")
        
        # Create access token
        print("Creating access token...")
        access_token = create_access_token(data={"sub": username})
        print("Access token created")
        
        return {"access_token": access_token, "token_type": "bearer", "username": username}
        
    except HTTPException:
        print("HTTPException raised in login, re-raising")
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# Get all users (for recipient selection)
@app.get("/api/users")
async def get_users(current_user: User = Depends(get_current_user)):
    try:
        users = await users_collection.find({}, {"username": 1, "_id": 0}).to_list(length=100)
        return {"users": [user["username"] for user in users if user["username"] != current_user.username]}
    except Exception as e:
        print(f"Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

# Upload and encrypt file
@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    recipient_username: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="Invalid file")
        
        if not is_file_allowed(file.filename):
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Check if recipient exists
        recipient_data = await users_collection.find_one({"username": recipient_username})
        if not recipient_data:
            raise HTTPException(status_code=404, detail="Recipient not found")
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        
        # For now, we'll use a simple encryption approach
        # In a real implementation, you would use the recipient's public key
        # For demonstration, we'll just store the file encrypted with a simple key
        
        # Create a simple encrypted version (this is just for demo)
        import base64
        encrypted_data = base64.b64encode(file_content)
        
        # Create file record
        file_id = str(uuid.uuid4())
        file_record = FileRecord(
            file_id=file_id,
            filename=file.filename,
            sender_username=current_user.username,
            recipient_username=recipient_username,
            encrypted_data=encrypted_data,
            ciphertext=b"demo_ciphertext",
            signature=b"demo_signature",
            nonce=b"demo_nonce",
            sender_public_key=b"demo_public_key"
        )
        
        # Save to database
        await files_collection.insert_one(file_record.to_dict())
        
        return {
            "message": "File uploaded successfully",
            "file_id": file_id,
            "filename": file.filename,
            "recipient": recipient_username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Get user's received files
@app.get("/api/files/received")
async def get_received_files(current_user: User = Depends(get_current_user)):
    try:
        files = await files_collection.find(
            {"recipient_username": current_user.username},
            {"file_id": 1, "filename": 1, "sender_username": 1, "_id": 0}
        ).to_list(length=100)
        
        return {"files": files}
    except Exception as e:
        print(f"Get received files error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get received files: {str(e)}")

# Get user's sent files
@app.get("/api/files/sent")
async def get_sent_files(current_user: User = Depends(get_current_user)):
    try:
        files = await files_collection.find(
            {"sender_username": current_user.username},
            {"file_id": 1, "filename": 1, "recipient_username": 1, "_id": 0}
        ).to_list(length=100)
        
        return {"files": files}
    except Exception as e:
        print(f"Get sent files error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get sent files: {str(e)}")

# Download and decrypt file
@app.post("/api/download")
async def download_file(
    file_id: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # Find file record
        file_data = await files_collection.find_one({"file_id": file_id})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_record = FileRecord.from_dict(file_data)
        
        # Check if user is the recipient
        if file_record.recipient_username != current_user.username:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # For demo purposes, just decode the base64 data
        import base64
        decrypted_data = base64.b64decode(file_record.encrypted_data)
        
        # Create temporary file
        temp_file_path = os.path.join(TEMP_DIR, f"{file_id}_{file_record.filename}")
        with open(temp_file_path, "wb") as f:
            f.write(decrypted_data)
        
        return FileResponse(
            temp_file_path,
            filename=file_record.filename,
            media_type="application/octet-stream"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

# Get file metadata
@app.get("/api/files/{file_id}/metadata")
async def get_file_metadata(
    file_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        # Find file record
        file_data = await files_collection.find_one({"file_id": file_id})
        if not file_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_record = FileRecord.from_dict(file_data)
        
        # Check if user is the recipient or sender
        if (file_record.recipient_username != current_user.username and 
            file_record.sender_username != current_user.username):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Encode metadata for JSON response
        metadata = encode_metadata(
            file_record.ciphertext,
            file_record.signature,
            file_record.nonce,
            file_record.sender_public_key
        )
        
        return {
            "file_id": file_record.file_id,
            "filename": file_record.filename,
            "sender_username": file_record.sender_username,
            "recipient_username": file_record.recipient_username,
            "metadata": metadata
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get metadata error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get metadata: {str(e)}")

# Health check
@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        await users_collection.find_one()
        return {"status": "healthy", "message": "Secure File Transfer System is running", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Database connection failed: {str(e)}", "database": "disconnected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=os.getenv("HOST", "0.0.0.0"), 
        port=int(os.getenv("PORT", "8000"))
    )
