import os

UPLOAD_DIR = "uploads"

def save_bytes(name, data):
    with open(os.path.join(UPLOAD_DIR, name), "wb") as f:
        f.write(data)

def load_file_bytes(name):
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "rb") as f:
        return f.read()
