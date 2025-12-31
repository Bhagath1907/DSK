try:
    from langchain.agents import create_openai_tools_agent
    print("Success: create_openai_tools_agent")
except ImportError as e:
    print(f"Error: {e}")

try:
    from langchain.agents import create_tool_calling_agent
    print("Success: create_tool_calling_agent")
except ImportError as e:
    print(f"Error: {e}")

try:
    import langchain
    print(f"LangChain Version: {langchain.__version__}")
except:
    print("Could not get version")
