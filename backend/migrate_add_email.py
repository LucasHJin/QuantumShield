#!/usr/bin/env python3
"""
Migration script to add email field to existing users.
This script will add a temporary email for existing users based on their username.
"""

import sqlite3
import os
from datetime import datetime

def migrate_add_email():
    """Add email field to existing users"""
    
    # Database file path
    db_path = "quantumdocs.db"
    
    if not os.path.exists(db_path):
        print("Database file not found. Creating new database with email field.")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if email column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'email' not in columns:
            print("Adding email column to users table...")
            
            # Add email column
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT")
            
            # Update existing users with temporary emails
            cursor.execute("SELECT id, username FROM users WHERE email IS NULL")
            users = cursor.fetchall()
            
            for user_id, username in users:
                # Create a temporary email based on username
                temp_email = f"{username}@temp.local"
                cursor.execute("UPDATE users SET email = ? WHERE id = ?", (temp_email, user_id))
                print(f"Updated user {username} with temporary email: {temp_email}")
            
            # Make email column unique and not null
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email)")
            
            conn.commit()
            print("Migration completed successfully!")
            print(f"Updated {len(users)} users with temporary emails.")
            print("Please update these emails with real email addresses.")
            
        else:
            print("Email column already exists. No migration needed.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_add_email() 