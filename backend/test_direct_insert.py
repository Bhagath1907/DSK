import os
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"URL: {url}")
print(f"Key exists: {'Yes' if key else 'No'}")

client = create_client(url, key)

# Try to insert a test record
try:
    # First, get a valid user ID
    users = client.table("users").select("id").limit(1).execute()
    if users.data:
        user_id = users.data[0]['id']
        print(f"Found user: {user_id}")
        
        # Insert login history
        result = client.table("login_history").insert({
            "user_id": user_id,
            "ip_address": "127.0.0.1",
            "user_agent": "Test Script"
        }).execute()
        print(f"Insert result: {result}")
    else:
        print("No users found")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
