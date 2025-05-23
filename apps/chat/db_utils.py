import psycopg2
from psycopg2.extras import DictCursor, Json
import numpy as np
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()


class VectorDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="127.0.0.1",  # os.getenv("POSTGRES_HOST")
            port=5432,  # os.getenv("POSTGRES_PORT")
            database="postgres",  # os.getenv("POSTGRES_DBNAME")
            user="dimitris.spachos",  # os.getenv("POSTGRES_USERNAME")
            password="dimitris",  # os.getenv("POSTGRES_PASSWORD")
        )

    def search_similar(
        self, embedding: List[float], limit: int = 5
    ) -> List[Dict[str, Any]]:
        with self.conn.cursor(cursor_factory=DictCursor) as cur:
            cur.execute(
                """
                SELECT content, embedding <-> %s::vector as distance
                FROM embeddings
                ORDER BY distance
                LIMIT %s;
            """,
                (embedding, limit),
            )
            results = cur.fetchall()
            return [dict(row) for row in results]

    def close(self):
        self.conn.close()
