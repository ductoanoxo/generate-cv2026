FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for WeasyPrint, docling, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Bypass start.sh to avoid CRLF/shebang issues from Windows volume mount
CMD ["sh", "-c", "python scripts/seed_vectors.py || echo 'Warning: Vector seeding issue, proceeding...' ; exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
