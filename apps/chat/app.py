from langchain.memory.chat_memory import BaseChatMemory
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import StrOutputParser
from langchain.chains.conversation.memory import ConversationBufferMemory
import os
from langchain.schema.runnable import Runnable, RunnablePassthrough
from langchain.schema.runnable.config import RunnableConfig
from typing import cast

import chainlit as cl
from pydantic import SecretStr


@cl.on_chat_start
async def start_chat():
    model = ChatOpenAI(
        streaming=True,
        api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
        model="claude-3-5-sonnet",
        base_url="https://llm.de103.amazee.ai",
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful chatbot.",
            ),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ]
    )
    history = ConversationBufferMemory(return_messages=True)
    runnable = (
        RunnablePassthrough.assign(
            history=lambda _: history.load_memory_variables({})["history"]
        )
        | prompt
        | model
        | StrOutputParser()
    )
    cl.user_session.set("history", history)
    cl.user_session.set("runnable", runnable)


@cl.on_message
async def on_message(message: cl.Message):
    runnable = cast(Runnable, cl.user_session.get("runnable"))
    history = cast(BaseChatMemory, cl.user_session.get("history"))
    msg = cl.Message(content="")
    async for chunk in runnable.astream(
        {"question": message.content},
        config=RunnableConfig(callbacks=[cl.LangchainCallbackHandler()]),
    ):
        await msg.stream_token(chunk)

    history.save_context({"input": message.content}, {"output": msg.content})
    await msg.send()
