-- Enable the pgvector extension so we can store vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the table that Search API will use for storing embeddings
CREATE TABLE IF NOT EXISTS search_api_vector (
  id BIGSERIAL PRIMARY KEY,
  content VARCHAR,
  drupal_entity_id VARCHAR,
  drupal_long_id VARCHAR,
  server_id VARCHAR,
  index_id VARCHAR,
  embedding vector(1024)
);
