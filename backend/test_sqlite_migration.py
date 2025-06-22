#!/usr/bin/env python3
"""
Test script to verify SQLite migration works correctly
"""

import asyncio
from database import get_db, find_user_by_username, create_user, get_all_users, User
from models import SessionLocal, User as UserModel
from auth import get_password_hash

async def test_database_operations():
    """Test basic database operations"""
    print("🧪 Testing SQLite database operations...")
    
    # Get database session
    db = SessionLocal()
    try:
        # Test user creation
        test_user = User(
            username="testuser",
            password_hash=get_password_hash("testpassword")
        )
        
        print("📝 Creating test user...")
        user = await create_user(db, test_user)
        print(f"✅ User created with ID: {user.id}")
        
        # Test user lookup
        print("🔍 Looking up test user...")
        found_user = await find_user_by_username(db, "testuser")
        if found_user:
            print(f"✅ User found: {found_user.username}")
        else:
            print("❌ User not found")
        
        # Test get all users
        print("📋 Getting all users...")
        all_users = await get_all_users(db)
        print(f"✅ Found {len(all_users)} users")
        
        # Clean up test user
        print("🧹 Cleaning up test user...")
        test_user_model = db.query(UserModel).filter(UserModel.username == "testuser").first()
        if test_user_model:
            db.delete(test_user_model)
            db.commit()
            print("✅ Test user deleted")
        
        print("🎉 All database tests passed!")
        
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_database_operations()) 