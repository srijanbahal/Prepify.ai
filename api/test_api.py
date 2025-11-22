import requests
import json

url = "http://localhost:8000/analyze"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer test-token"
}
data = {
    "resume_text": "John Doe. Software Engineer with 3 years experience in React, Node.js, and Python. Built scalableapplications. Expert in cloud platforms.",
    "job_description": "Looking for Senior Software Engineer with React and Node.js expertise. Must have 2+ years experience."
}

print("Testing /analyze endpoint with Groq API...")
print("Request:", json.dumps(data, indent=2))
print("\nSending request to", url)
print("-" * 60)

try:
    response = requests.post(url, json=data, headers=headers, timeout=120)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"\nError: {e}")
