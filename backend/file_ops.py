import os

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_bytes(name, data):
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(data)

def load_file_bytes(name):
    with open(os.path.join(UPLOAD_DIR, name), "rb") as f:
        return f.read()
