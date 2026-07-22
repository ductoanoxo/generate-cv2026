#!/bin/bash
set -e

echo "=================================================="
echo "🚀 Starting Generate CV AI Service"
echo "=================================================="

QDRANT_TARGET_URL="${QDRANT_URL:-http://localhost:6333}"
echo "Target Qdrant URL: ${QDRANT_TARGET_URL}"

# Run Qdrant Vector Seeding
echo "Seeding Qdrant vector database with Supabase IT courses & CLOs..."
python scripts/seed_vectors.py "${QDRANT_TARGET_URL}" || echo "Warning: Vector seeding encountered an issue, proceeding with API server."

# Start FastAPI Application
echo "Launching FastAPI Uvicorn server on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
