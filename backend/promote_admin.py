import asyncio
from app.db.supabase import supabase

async def promote_admin():
    try:
        print("Finding user to promote...")
        # Find user starting with specific email to be safe
        response = supabase.table("users").select("id, email").ilike("email", "pothapiahalya%").execute()
        
        if not response.data:
            print("Target user not found.")
            # Fallback: List all and ask (or just pick the first one in dev env)
            print("Listing all users as fallback:")
            all_users = supabase.table("users").select("id, email").execute()
            if all_users.data:
                target = all_users.data[0]
                print(f"Promoting first found user: {target['email']}")
                uid = target['id']
            else:
                print("No users at all.")
                return
        else:
            target = response.data[0]
            uid = target['id']
            print(f"Found target user: {target['email']}")

        print(f"Promoting user {uid} to 'admin'...")
        update_res = supabase.table("users").update({"role": "admin"}).eq("id", uid).execute()
        
        print(f"Update result: {update_res.data}")
        print("Success! User is now an admin.")

    except Exception as e:
        print(f"Error promoting user: {e}")

if __name__ == "__main__":
    asyncio.run(promote_admin())
