#!/usr/bin/env python3
"""
Database migration script for QuantumDocs
"""

import os
import sqlite3
from models import engine, Base, User, SharedMetadata

def migrate_database():
    """Migrate the database to the latest schema"""
    print("🔄 Checking database schema...")
    
    # Check if database exists
    db_path = "./quantumdocs.db"
    if not os.path.exists(db_path):
        print("✅ Database doesn't exist, creating new one...")
        Base.metadata.create_all(bind=engine)
        return
    
    # Connect to existing database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if new columns exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    missing_columns = []
    required_columns = ['kem_salt', 'kem_nonce', 'sig_salt', 'sig_nonce']
    
    for col in required_columns:
        if col not in columns:
            missing_columns.append(col)
    
    if missing_columns:
        print(f"⚠️  Missing columns: {missing_columns}")
        print("🔄 Adding missing columns...")
        
        for col in missing_columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col} TEXT")
                print(f"✅ Added column: {col}")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"✅ Column {col} already exists")
                else:
                    print(f"❌ Error adding column {col}: {e}")
        
        conn.commit()
        print("✅ Database migration completed")
    else:
        print("✅ Database schema is up to date")
    
    conn.close()

def reset_database():
    """Reset the database (WARNING: This will delete all data)"""
    print("⚠️  WARNING: This will delete all data!")
    response = input("Are you sure you want to reset the database? (yes/no): ")
    
    if response.lower() == 'yes':
        print("🗑️  Deleting existing database...")
        if os.path.exists("./quantumdocs.db"):
            os.remove("./quantumdocs.db")
        
        print("🔄 Creating new database...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database reset completed")
    else:
        print("❌ Database reset cancelled")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        reset_database()
    else:
        migrate_database() 