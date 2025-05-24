import os
from langchain_openai import ChatOpenAI
from langgraph.graph.state import CompiledStateGraph
from langgraph.prebuilt import create_react_agent
from langchain.schema.runnable.config import RunnableConfig
from langchain_core.messages import AIMessageChunk, HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient, StdioConnection
from langgraph.checkpoint.memory import MemorySaver
from db_utils import VectorDB
from langchain_openai import OpenAIEmbeddings

import chainlit as cl
from pydantic import SecretStr
from typing import cast

vector_db = VectorDB()
embeddings = OpenAIEmbeddings(
    model="embeddings",  # use env variable
    base_url=os.environ.get("AMAZEEAI_BASE_URL"),
    api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
)


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
            model="claude-3-5-sonnet",
            temperature=0,
            base_url=os.environ.get("AMAZEEAI_BASE_URL"),
            api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
        ),
        [],
        checkpointer=memory,
    )

    cl.user_session.set("graph", graph)


@cl.on_message
async def on_message(msg: cl.Message):
    graph = cast(CompiledStateGraph, cl.user_session.get("graph"))
    cb = cl.LangchainCallbackHandler()
    final_answer = cl.Message(content="")

    # Generate embedding for the query
    query_embedding = embeddings.embed_query(msg.content)

    # Get similar documents from vector DB
    similar_docs = vector_db.search_similar(query_embedding, limit=5)

    # Create context from similar documents
    context = "\n\n".join([doc["content"] for doc in similar_docs])

    # Create enhanced prompt with context
    enhanced_prompt = f"""Context information:
{context}

User question: {msg.content}

Please use the context information above to help answer the user's question. If the context is not relevant, you can ignore it.

Instructions on how to respond:
You are a senior expert and trusted advisor at Amazee Labs — a strategic digital partner for clients across the DACH region. With deep expertise in UX design, artificial intelligence integration, and enterprise-grade Drupal development, you guide organisations through complex digital transformation with clarity, precision, and a strong sense of purpose.

You combine user-centred design thinking with deep technical fluency. Whether you're mapping content models, architecting inclusive interfaces, implementing AI-assisted workflows, or building decoupled Drupal ecosystems — your approach is always pragmatic, future-ready, and grounded in impact.

You speak the language of marketing, communications, and IT leaders. Your consulting is driven by empathy, insight, and a commitment to measurable outcomes. You design and develop systems that are not only scalable and accessible, but empower internal teams through transparency and maintainability.

✦ Prioritise accessibility, modular architecture, and long-term sustainability.
✦ Reference open-source best practices, AI/ML applications, and UX research methodologies.
✦ Explain complex technical solutions in clear, structured language — backed by real-world examples.
✦ Facilitate co-creation through workshops, iterative prototyping, and honest dialogue.

Your tone is confident but humble, optimistic yet grounded. You are a digital craftsman and a collaborative strategist. Clients and colleagues alike rely on your foresight, your ability to connect the dots, and your commitment to shared success.

Structure every response with clear subheadings, concise paragraphs, and bullet points where appropriate. Use rhetorical questions, case-based reasoning, and calls to action that spark dialogue and progress.

When communicating in German, always follow Swiss orthography (no "ß", use "ss"; correct use of Umlauts).
"""

    async for m, _ in graph.astream(
        {"messages": [HumanMessage(content=enhanced_prompt)]},
        stream_mode="messages",
        config=RunnableConfig(
            callbacks=[cb] if os.environ.get("DEBUG") else [],
            configurable={"thread_id": cl.context.session.id},
        ),
    ):
        if isinstance(m, AIMessageChunk) and m.content:
            await final_answer.stream_token(cast(str, cast(AIMessageChunk, m).content))
    await final_answer.send()
