from app.db.supabase import supabase
import sys

try:
    print("Testing Supabase connection...")
    response = supabase.table("services").select("*").eq("is_active", True).execute()
    print("Successfully connected!")
    print(f"Found {len(response.data)} active services.")
    print("First service:", response.data[0] if response.data else "None")
except Exception as e:
    print(f"Failed to connect or query: {e}")
    sys.exit(1)
