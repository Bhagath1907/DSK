import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from app.agent.tools import PlatformKnowledgeTool

def run_crew(query: str):
    # Debug: Check API Key
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"DEBUG: API Key loaded: {'Yes' if api_key else 'No'}")
    if not api_key:
        return "Error: OPENAI_API_KEY is missing in backend .env"

    # LLM Configuration
    try:
        # Using Direct OpenAI
        # gpt-4o-mini is cost-effective and capable
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=api_key,
            temperature=0
        )
        print("DEBUG: LLM Initialized (OpenAI gpt-4o-mini)")
    except Exception as e:
        print(f"DEBUG: Error initializing LLM: {e}")
        return f"Internal Error: {str(e)}"

    # Tools
    platform_tool = PlatformKnowledgeTool()
    tools = [platform_tool]
    
    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(tools)

    # Initial messages
    messages = [
        SystemMessage(content="""You are a helpful assistant for the DSK Portal. 
You have access to real-time data about services and categories using the platform_knowledge tool. 

**STRICT RESPONSE FORMATTING RULES:**
1. **Use Markdown**: Always use Markdown headers (###), bullet points, and bold text to organize your response.
2. **Be Structured**: Never output a "wall of text". Break information into logical sections.
3. **Services List**: When listing services, always use a Markdown Table with columns for Name, Price, and Category.
4. **Currency**: All prices are in Indian Rupees (INR). Always display prices with the '₹' symbol or 'INR' suffix (e.g., ₹100 or 100 INR).
5. **Tone**: Professional, concise, and helpful. 

If the user asks about services or categories, ALWAYS use the platform_knowledge tool to get the latest info first."""),
        HumanMessage(content=query)
    ]

    print(f"DEBUG: Invoking LLM with query: {query}")
    try:
        # First Run
        response_1 = llm_with_tools.invoke(messages)
        messages.append(response_1)
        print(f"DEBUG: First Response: {response_1}")

        # Check for tool calls
        if response_1.tool_calls:
            print(f"DEBUG: Tool calls found: {response_1.tool_calls}")
            for tool_call in response_1.tool_calls:
                if tool_call["name"] == "platform_knowledge":
                    print("DEBUG: Executing platform_knowledge tool...")
                    # Execute tool
                    tool_output = platform_tool.invoke(tool_call["args"])
                    print(f"DEBUG: Tool Output: {tool_output[:100]}...") # Print first 100 chars
                    # Append result
                    messages.append(ToolMessage(tool_call_id=tool_call["id"], content=tool_output))
            
            # Second Run (to generate final answer)
            print("DEBUG: Invoking LLM for final response...")
            response_2 = llm_with_tools.invoke(messages)
            print(f"DEBUG: Final Response: {response_2.content}")
            return response_2.content
        else:
            # No tool called, return initial response
            print("DEBUG: No tool calls, returning initial response")
            return response_1.content
    except Exception as e:
        print(f"DEBUG: Error during execution: {e}")
        import traceback
        traceback.print_exc()
        return f"I encountered an error processing your request: {str(e)}"
