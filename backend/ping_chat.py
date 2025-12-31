import requests
import json
import time

print("Sending request...")
start = time.time()
try:
    response = requests.post(
        "http://localhost:8000/api/v1/chat/",
        json={"message": "What services are available?"},
        timeout=60
    )
    duration = time.time() - start
    print(f"Request took {duration:.2f} seconds")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
