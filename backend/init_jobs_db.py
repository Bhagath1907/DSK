import os
import asyncio
from app.db.supabase import supabase

# Read the SQL file
SQL_FILE_PATH = "job_notifications.sql"

async def init_db():
    if not os.path.exists(SQL_FILE_PATH):
        print(f"Error: {SQL_FILE_PATH} not found.")
        return

    # Check if table exists by trying to select from it
    try:
        print("Checking if 'job_notifications' table exists...")
        # We expect this to fail if table doesn't exist
        res = supabase.table("job_notifications").select("count", count="exact", head=True).execute()
        print("Table 'job_notifications' already exists.")
        return
    except Exception as e:
        print(f"Table check failed (likely doesn't exist): {e}")
        print("Attempting to create table...")

    # Since we can't execute raw SQL via supabase-py client directly without RPC,
    # and we don't have psycopg2 connection details exposed clearly (only URL/KEY),
    # verifying if we can use a workaround or must ask user.
    
    # Workaround: If there is a "exec_sql" RPC function (common in some setups), try it.
    try:
        with open(SQL_FILE_PATH, 'r') as f:
            sql_content = f.read()
            
        # Try a common RPC name often used in Supabase starter kits
        # This is a shot in the dark, but worth a try before asking user.
        res = supabase.rpc("exec_sql", {"query": sql_content}).execute()
        print("Executed SQL via RPC.")
    except Exception as e:
        print(f"Could not execute SQL via RPC: {e}")
        print("\n" + "="*50)
        print("MANUAL ACTION REQUIRED")
        print("Please run the contents of 'backend/job_notifications.sql' in your Supabase SQL Editor.")
        print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(init_db())
