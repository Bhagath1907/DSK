import asyncio
import os
from app.db.supabase import supabase
from app.core.config import settings

async def check_users():
    print(f"CWD: {os.getcwd()}")
    print(f"Supabase URL: {settings.SUPABASE_URL[:10]}...")
    print(f"Service Key Loaded: {'Yes' if settings.SUPABASE_SERVICE_ROLE_KEY else 'No'}")
    
    try:
        print("Fetching users (id, email)...")
        # Try fetching just id and email first to avoid schema issues
        response = supabase.table("users").select("id, email").execute()
        
        if not response.data:
            print("No users found.")
        else:
            print(f"Found {len(response.data)} users.")
            for user in response.data:
                print(f"User: {user['email']} (ID: {user['id']})")
                
                # Check role separately for each user to debug
                try:
                    role_res = supabase.table("users").select("role").eq("id", user['id']).execute()
                    role = role_res.data[0].get('role') if role_res.data else "None"
                    print(f"  -> Role: {role}")
                except Exception as e:
                    print(f"  -> Failed to fetch role: {e}")

    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_users())
