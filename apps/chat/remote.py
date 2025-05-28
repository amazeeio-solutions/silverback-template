# prototype implementation of chainlit + remote agent
import os
from langgraph.graph.state import CompiledStateGraph
from langchain.schema.runnable.config import RunnableConfig
from langchain_core.messages import HumanMessage
from langgraph.pregel.remote import RemoteGraph

import chainlit as cl
from typing import cast


@cl.on_chat_start
async def on_chat_start():
    graph = RemoteGraph("agent", url="http://localhost:2024")
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
        if isinstance(m, dict) and m["content"]:
            content = cast(str, m["content"])
            await final_answer.stream_token(content)

    await final_answer.send()
