import asyncio
from app.db.supabase import supabase

async def fix_missing_users():
    print("--- Starting User Sync ---")
    try:
        # 1. Fetch all users from Supabase Auth
        # Note: list_users might differ by SDK version. 
        # Tring the admin method.
        print("Fetching users from Supabase Auth...")
        # Since we use Service Role Key, we can list users.
        # Pagination might be needed but let's assume < 50 users for now.
        auth_users_response = supabase.auth.admin.list_users()
        
        # If response is just a list or inside an object
        auth_users = auth_users_response.users if hasattr(auth_users_response, 'users') else auth_users_response
        
        print(f"Found {len(auth_users)} users in Auth system.")
        
        for user in auth_users:
            uid = user.id
            email = user.email
            print(f"Checking user: {email} ({uid})")
            
            # 2. Check public.users
            public_user_res = supabase.table("users").select("*").eq("id", uid).execute()
            
            if not public_user_res.data:
                print(f"  -> MISSING in public.users! Creating...")
                # Create user in public table
                new_user = {
                    "id": uid,
                    "email": email,
                    "role": "user", # Default
                    "full_name": user.user_metadata.get('full_name', 'Unknown')
                }
                
                insert_res = supabase.table("users").insert(new_user).execute()
                print(f"  -> Insert result: {insert_res.data}")
            else:
                print(f"  -> Exists in public.users.")
                
            # 3. Promote specific user to Admin if needed
            if email.startswith("sameerai2809190"):
                print(f"  -> Promoting {email} to ADMIN.")
                supabase.table("users").update({"role": "admin"}).eq("id", uid).execute()

        print("--- Sync Complete ---")

    except Exception as e:
        print(f"Error during sync: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_missing_users())
