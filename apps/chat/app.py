from openai import AsyncOpenAI
import os

import chainlit as cl

print(os.environ.get("AMAZEEAI_API_KEY"))

client = AsyncOpenAI(
    api_key=os.environ.get("AMAZEEAI_API_KEY"),
    base_url="https://llm.de103.amazee.ai",  # TODO: read this from drupal config?
)

cl.instrument_openai()


@cl.on_message
async def on_message(message: cl.Message):
    response = await client.chat.completions.create(
        messages=[
            {
                "content": "You are a helpful bot.",
                "role": "system",
            },
            {"content": message.content, "role": "user"},
        ],
        model="claude-3-5-sonnet",
    )
    if response.choices[0].message.content:
        await cl.Message(content=response.choices[0].message.content).send()
