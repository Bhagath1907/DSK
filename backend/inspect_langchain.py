import langchain
import langchain.agents
print(f"File: {langchain.__file__}")
print(f"Version: {langchain.__version__}")
print(f"Agents dir: {dir(langchain.agents)}")
try:
    from langchain.agents import initialize_agent, AgentType
    print("Success: initialize_agent")
except ImportError as e:
    print(f"Error initialize_agent: {e}")
