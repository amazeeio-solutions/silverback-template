from typing import List, Dict, Any, cast
import numpy as np
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chainlit as cl
import os
from pydantic import SecretStr


class InMemoryFileStore:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model="embeddings",
            base_url=os.environ.get("AMAZEEAI_BASE_URL"),
            api_key=cast(SecretStr, os.environ.get("AMAZEEAI_API_KEY")),
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.file_contents: Dict[str, List[Dict[str, Any]]] = {}

    async def process_file(self, file: cl.File) -> None:
        """Process a file and store its embeddings in memory"""
        try:
            with open(file.path, "rb") as f:
                content = f.read()

            text = content.decode("utf-8")
            chunks = self.text_splitter.split_text(text)
            embeddings = await self.embeddings.aembed_documents(chunks)

            self.file_contents[file.id] = [
                {"content": chunk, "embedding": embedding}
                for chunk, embedding in zip(chunks, embeddings)
            ]
        except Exception as e:
            print(f"Error processing file {file.name}: {str(e)}")
            raise

    def search_similar(
        self, query_embedding: List[float], limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for similar content across all stored files"""
        all_chunks = []
        for file_chunks in self.file_contents.values():
            all_chunks.extend(file_chunks)

        if not all_chunks:
            return []

        # Calculate cosine similarity
        similarities = []
        for chunk in all_chunks:
            similarity = np.dot(query_embedding, chunk["embedding"]) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk["embedding"])
            )
            similarities.append((similarity, chunk))

        # Sort by similarity and return top results
        similarities.sort(reverse=True)
        return [chunk for _, chunk in similarities[:limit]]
