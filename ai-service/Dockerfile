FROM python:3.11-slim

WORKDIR /app

# Docling is CPU-only; keep optional model caches disposable inside the container.
ENV CUDA_VISIBLE_DEVICES="" \
    DOCLING_DEVICE="cpu" \
    HF_HOME="/tmp/docling-hf" \
    TORCH_HOME="/tmp/docling-torch"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential libpango-1.0-0 libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 libffi-dev shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && rm -rf /root/.cache/pip /root/.cache/huggingface /root/.cache/torch

COPY . .
EXPOSE 8000
CMD ["sh", "-c", "python scripts/seed_vectors.py || echo 'Warning: Vector seeding issue, proceeding...' ; exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
