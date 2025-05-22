import os
from langchain_openai import ChatOpenAI
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import ToolNode, create_react_agent
from langchain.schema.runnable.config import RunnableConfig
from langchain_core.messages import AIMessageChunk, HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient, StdioConnection
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver

import chainlit as cl
from pydantic import SecretStr
from typing import cast

from langchain_core.messages import HumanMessage


@cl.on_chat_start
async def on_chat_start():
    memory = MemorySaver()

    client = MultiServerMCPClient(
        {
            "drupal": cast(
                StdioConnection,
                {
                    "command": "mcp-graphql",
                    "args": [],
                    "env": {
                        "ENDPOINT": "http://nginx:8080/mcp",
                        "HEADERS": '{"api-key": "8fad39495df277f06a0eb58c1f101029"}',
                        "ALLOW_MUTATIONS": "true",
                    },
                    "transport": "stdio",
                },
            )
        }
    )

    graph = create_react_agent(
        ChatOpenAI(
            model="claude-3-5-haiku",
            temperature=0,
            base_url=os.environ.get("AMAZEEAI_BASE_URL"),
            api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
        ),
        tools=ToolNode(await client.get_tools()),
        checkpointer=memory,
    )

    cl.user_session.set("graph", graph)


@cl.on_message
async def on_message(msg: cl.Message):
    graph = cast(CompiledStateGraph, cl.user_session.get("graph"))
    cb = cl.LangchainCallbackHandler()
    final_answer = cl.Message(content="")

    async for m, _ in graph.astream(
        {"messages": [HumanMessage(content=msg.content)]},
        stream_mode="messages",
        config=RunnableConfig(
            callbacks=[cb] if os.environ.get("DEBUG") else [],
            configurable={"thread_id": cl.context.session.id},
        ),
    ):
        if isinstance(m, AIMessageChunk) and m.content:
            await final_answer.stream_token(cast(str, cast(AIMessageChunk, m).content))
    await final_answer.send()
