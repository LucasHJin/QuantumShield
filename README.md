# Secure File Transfer System

A full-stack secure file transfer application built with post-quantum cryptography, featuring user authentication, encrypted file sharing, and digital signatures.

## 🚀 Features

### 🔐 Post-Quantum Cryptography
- **Kyber**: Key encapsulation mechanism for secure key exchange
- **Dilithium**: Digital signature algorithm for file authentication
- **AES-GCM**: Symmetric encryption for file content

### 👥 User Management
- User registration with automatic PQC key pair generation
- Secure password hashing with bcrypt
- JWT-based authentication
- User-specific key management

### 📁 File Operations
- Secure file upload with recipient selection
- Automatic encryption and signing
- File inbox for received files
- Download and decryption with signature verification
- Sent files tracking

### 🏗️ Architecture
- **Backend**: FastAPI with SQLite (via SQLAlchemy)
- **Frontend**: Next.js with modern UI
- **Database**: SQLite for user and file storage
- **Security**: All cryptographic operations server-side

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLite**: Serverless SQL database (via SQLAlchemy ORM)
- **pyOQS**: Post-quantum cryptography library
- **PyCryptodome**: AES-GCM encryption
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing

### Frontend
- **Next.js**: React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Hook Form**: Form management
- **React Hot Toast**: Notifications

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- (No database server required; uses local SQLite file)
- Virtual environment (already set up)

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in the `backend` directory with the following variables:

```bash
# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000

# File Configuration
MAX_FILE_SIZE=100

# CORS Configuration
CORS_ORIGINS=*
```

### 2. Run the Application
```bash
# Make the startup script executable (if not already)
chmod +x start.sh

# Run the complete setup
./start.sh
```

This script will:
- Activate the virtual environment
- Install all dependencies
- Run database migration for SQLite
- Start both backend and frontend servers

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📖 Manual Setup

If you prefer to set up manually:

### Backend Setup
```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run database migration (creates SQLite DB if not present)
python migrate_db.py

# Start server
python main.py
```

### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## 🔐 Security Features

### Key Management
- Each user gets unique Kyber and Dilithium key pairs
- Private keys never leave the server
- Keys stored securely in SQLite

### File Encryption Workflow
1. **Sender**: Uses recipient's Kyber public key to encapsulate shared secret
2. **Encryption**: AES-GCM encrypts file with shared secret
3. **Signing**: Sender signs encrypted file with Dilithium private key
4. **Storage**: Encrypted file + metadata stored in database

### File Decryption Workflow
1. **Recipient**: Uses their Kyber private key to decapsulate shared secret
2. **Verification**: Verifies sender's signature with their Dilithium public key
3. **Decryption**: AES-GCM decrypts file with shared secret

## 📊 Database Schema

### Users Table (SQLite)
| Column         | Type     | Description                       |
|---------------|----------|-----------------------------------|
| id            | Integer  | Primary key                       |
| username      | String   | Unique username                   |
| email         | String   | Unique email                      |
| hashed_password | String | Hashed password                   |
| kem_public_key | Text    | Kyber public key (Base64)         |
| kem_secret_key | Text    | Kyber secret key (Base64, encrypted) |
| kem_salt      | Text     | Salt for KEM key encryption       |
| kem_nonce     | Text     | Nonce for KEM key encryption      |
| sig_public_key | Text    | Dilithium public key (Base64)     |
| sig_secret_key | Text    | Dilithium secret key (Base64, encrypted) |
| sig_salt      | Text     | Salt for signature key encryption |
| sig_nonce     | Text     | Nonce for signature key encryption|
| created_at    | DateTime | Account creation timestamp        |

### SharedMetadata Table (SQLite)
| Column            | Type     | Description                       |
|-------------------|----------|-----------------------------------|
| id                | Integer  | Primary key                       |
| file_id           | String   | UUID for file                     |
| encrypted_key     | Text     | Encrypted file key (Base64)       |
| nonce             | Text     | Nonce for file encryption         |
| signature         | Text     | Digital signature (Base64)        |
| sender_public_key | Text     | Sender's Dilithium public key     |
| sender_id         | Integer  | Foreign key to users (sender)     |
| recipient_id      | Integer  | Foreign key to users (recipient)  |
| encrypted_metadata| Text     | Encrypted metadata (Base64)       |
| created_at        | DateTime | Timestamp                         |
| is_read           | Boolean  | Read status                       |

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### File Operations
- `GET /api/users` - Get all users (for recipient selection)
- `POST /api/upload` - Upload and encrypt file
- `GET /api/files/received` - Get received files
- `GET /api/files/sent` - Get sent files
- `POST /api/download` - Download and decrypt file
- `GET /api/files/{file_id}/metadata` - Get file metadata

## 🎯 Usage Guide

### 1. Registration
- Visit http://localhost:3000
- Click "Register" to create an account
- System automatically generates your PQC key pairs

### 2. File Upload
- Log in to your account
- Go to "Upload File" tab
- Select a file and choose a recipient
- Click "Upload & Encrypt"

### 3. File Download
- Go to "Received Files" tab
- Click "Download & Decrypt" on any file
- File will be automatically decrypted and downloaded

### 4. File Management
- View sent files in "Sent Files" tab
- Refresh lists to see new files
- All operations are secure and authenticated

## 🔍 Troubleshooting

### Common Issues

**Dependencies Issues**
```bash
# Reinstall backend dependencies
cd backend
pip install -r requirements.txt --force-reinstall

# Reinstall frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables Not Loading**
```bash
# Make sure .env file exists in backend directory
ls -la backend/.env

# Check if python-dotenv is installed
pip list | grep python-dotenv
```

## 🔒 Security Considerations

- Private keys are never exposed to the frontend
- All cryptographic operations happen server-side
- Passwords are hashed with bcrypt
- JWT tokens have expiration times
- File access is restricted to authorized users only
- Signature verification prevents tampering

## 📝 Development

### Project Structure
```
spurhacks/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # SQLite models and connection
│   ├── auth.py              # Authentication utilities
│   ├── crypto_utils.py      # PQC cryptography functions
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (create this)
├── frontend/
│   ├── src/app/
│   │   ├── page.js          # Main application
│   │   ├── AuthContext.js   # Authentication context
│   │   ├── LoginForm.js     # Login component
│   │   ├── RegisterForm.js  # Registration component
│   │   ├── Dashboard.js     # Main dashboard
│   │   ├── FileUpload.js    # File upload component
│   │   ├── FileInbox.js     # Received files component
│   │   └── SentFiles.js     # Sent files component
│   └── package.json         # Node.js dependencies
└── start.sh                 # Startup script
```

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `your-secret-key-change-in-production` | JWT secret key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT token expiration time |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `MAX_FILE_SIZE` | `100` | Maximum file size in MB |
| `CORS_ORIGINS` | `*` | CORS allowed origins |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NIST**: For post-quantum cryptography standards
- **liboqs**: For the pyOQS Python bindings
- **FastAPI**: For the excellent web framework
- **Next.js**: For the React framework
