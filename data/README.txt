# AI Creator Discovery Engine

## Project Description
This project is a hybrid creator discovery engine that allows brands to find creators using semantic search and ranking.

The system uses vector embeddings and business ranking signals to return relevant creators based on a search query.

## Features
- Semantic search using embeddings
- Hybrid ranking system
- Explainable scoring
- Creator ingestion pipeline
- Express API
- PostgreSQL + pgvector

## Tech Stack
- Node.js
- Express
- TypeScript
- PostgreSQL
- pgvector
- Docker

## Setup Instructions

Install dependencies

npm install

Start database

docker compose up -d

Initialize schema

npm run db:init

Load creators

npm run ingest

Start API

npm run dev

## Test API

Health check

http://localhost:3000/health

Search creators

http://localhost:3000/search?q=AI

## Example Search Queries

http://localhost:3000/search?q=AI  
http://localhost:3000/search?q=data  
http://localhost:3000/search?q=cloud  

## Project Structure

src/
api.ts
search.ts
rank.ts
ingest.ts

data/
creators.json

## Author
Sindusha Muvva