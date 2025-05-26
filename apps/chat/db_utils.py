import psycopg2
from psycopg2.extras import DictCursor
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()


class VectorDB:
    def __init__(self):
        self.conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            port=os.getenv("POSTGRES_PORT"),
            database=os.getenv("POSTGRES_DBNAME"),
            user=os.getenv("POSTGRES_USERNAME"),
            password=os.getenv("POSTGRES_PASSWORD"),
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
