from langchain_groq import ChatGroq
from config import GROQ_API_KEY, GROQ_MODEL
import os

# Set environment variable
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

print("Testing ChatGroq direct connection...")
print(f"Model: {GROQ_MODEL}")
print(f"API Key present: {bool(GROQ_API_KEY)}")
print(f"API Key length: {len(GROQ_API_KEY) if GROQ_API_KEY else 0}")

try:
    llm = ChatGroq(
        model=GROQ_MODEL,
        api_key=GROQ_API_KEY,
        temperature=0.7
    )
    
    print("\nChatGroq initialized successfully!")
    print("Sending test message...")
    
    response = llm.invoke("Say hello in one sentence")
    print(f"\nResponse: {response.content}")
    print("\n✅ ChatGroq is working!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    print(f"\nFull traceback:\n{traceback.format_exc()}")
