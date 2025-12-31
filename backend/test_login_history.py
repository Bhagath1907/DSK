import requests

try:
    response = requests.post(
        "http://localhost:8000/api/v1/auth/record-login",
        json={"user_id": "test-user-id", "user_agent": "Test Agent"},
        timeout=10
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
