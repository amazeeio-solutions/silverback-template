from typing import List
from chainlit.mcp import McpConnection
import json
from openai import AsyncOpenAI
import os
from mcp import ClientSession
import pprint

import chainlit as cl
from openai.types.chat import ChatCompletionMessageParam

print(os.environ.get("AMAZEEAI_API_KEY"))

client = AsyncOpenAI(
    api_key=os.environ.get("AMAZEEAI_API_KEY"),
    # TODO: read this from drupal config?
    base_url="https://llm.de103.amazee.ai",
)

cl.instrument_openai()
pp = pprint.PrettyPrinter(indent=2).pprint


@cl.on_chat_start
async def start_chat():
    initialPrompt: ChatCompletionMessageParam = {
        "role": "system",
        "content": "You are a helpful chatbot.",
    }
    cl.user_session.set("history", [initialPrompt])


@cl.on_message
async def on_message(message: cl.Message):
    history: List[ChatCompletionMessageParam] = cl.user_session.get("history") or []
    history.append({"content": message.content, "role": "user"})
    msg = cl.Message(content="")
    stream = await client.chat.completions.create(
        messages=history,
        model="claude-3-5-sonnet",
        stream=True,
    )
    async for part in stream:
        await msg.stream_token(part.choices[0].delta.content or "")
    history.append({"role": "assistant", "content": msg.content})
    await msg.send()
