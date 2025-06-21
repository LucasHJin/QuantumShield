from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
import base64
import uuid
import os
from crypto_utils import encrypt_file_logic, decrypt_file_logic
from file_ops import save_bytes, load_file_bytes
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/encrypt")
async def encrypt_file(file: UploadFile = File(...)):
    contents = await file.read()
    file_id = str(uuid.uuid4())
    encrypted_file, response_meta = encrypt_file_logic(contents, file_id)
    save_bytes(f"{file_id}.enc", encrypted_file)
    return response_meta


@app.post("/api/decrypt")
async def decrypt_file(
    file_id: str = Form(...),
    encrypted_key: str = Form(...),
    nonce: str = Form(...),
    signature: str = Form(...),
    sender_public_key: str = Form(...)
):
    enc_file = load_file_bytes(f"{file_id}.enc")
    success, output_path_or_error = decrypt_file_logic(
        file_id, enc_file, encrypted_key, nonce, signature, sender_public_key
    )
    if not success:
        return {"error": output_path_or_error}
    return FileResponse(output_path_or_error, filename=f"{file_id}.dec")


@app.get("/api/download/{file_id}")
async def download_encrypted_file(file_id: str):
    path = os.path.join(UPLOAD_DIR, f"{file_id}.enc")
    return FileResponse(path, media_type="application/octet-stream")
