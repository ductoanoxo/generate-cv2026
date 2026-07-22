import os
import sys
import logging
from typing import List, Dict, Any

# Ensure app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from app.config import settings
from app.services.embedding_service import embedding_service
from scripts.sync_supabase_clos import fetch_supabase_cntt_subjects

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

COLLECTION_NAME = "course_clos"

def seed_qdrant(qdrant_url: str = None):
    """
    Seeds Qdrant Vector Database with exact pre-existing Supabase IT subjects and CLOs.
    """
    target_qdrant_url = qdrant_url or settings.QDRANT_URL
    logger.info(f"Connecting to Qdrant at: {target_qdrant_url}")

    client = QdrantClient(url=target_qdrant_url, api_key=settings.QDRANT_API_KEY)

    # 1. Fetch subjects directly from Supabase database
    supabase_subjects = fetch_supabase_cntt_subjects()
    logger.info(f"Retrieved {len(supabase_subjects)} core IT subjects from Supabase database for vector seeding.")

    # 2. Create or recreate collection
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]

    if COLLECTION_NAME in collection_names:
        logger.info(f"Collection '{COLLECTION_NAME}' exists. Re-creating for fresh seed...")
        client.delete_collection(collection_name=COLLECTION_NAME)

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=embedding_service.dimension, distance=Distance.COSINE)
    )
    logger.info(f"Collection '{COLLECTION_NAME}' created successfully with 1536-dim Cosine distance configuration.")

    # Prepare all item texts and payloads for batch embedding
    items_to_embed: List[Dict[str, Any]] = []

    for subject in supabase_subjects:
        sub_code = subject["subject_code"]
        sub_name = subject["subject_name"]
        sub_desc = f"Môn học chuyên ngành Khoa CNTT Supabase: {sub_name} ({sub_code})."
        dept = subject["department"]

        # Subject record
        subject_text = f"Môn học: {sub_name} ({sub_code}). Mô tả: {sub_desc}. Khoa: {dept}."
        items_to_embed.append({
            "text": subject_text,
            "payload": {
                "type": "subject",
                "subject_code": sub_code,
                "subject_name": sub_name,
                "credits": subject["credits"],
                "department": dept,
                "description": sub_desc,
                "content": subject_text
            }
        })

        # CLO records
        clo_info = subject["clo_info"]
        all_clos = []
        for k in clo_info["knowledge"]:
            all_clos.append(("Kiến thức", k))
        for s in clo_info["skills"]:
            all_clos.append(("Kỹ năng", s))
        for a in clo_info["autonomy"]:
            all_clos.append(("Năng lực tự chủ và trách nhiệm", a))

        for idx, (clo_cat, clo_content) in enumerate(all_clos, start=1):
            clo_code = f"CLO{idx}"
            clo_text = f"Môn học: {sub_name} ({sub_code}). {clo_code} [{clo_cat}]: {clo_content}"

            items_to_embed.append({
                "text": clo_text,
                "payload": {
                    "type": "clo",
                    "subject_code": sub_code,
                    "subject_name": sub_name,
                    "clo_code": clo_code,
                    "category": clo_cat,
                    "department": dept,
                    "content": clo_content,
                    "full_text": clo_text
                }
            })

    # Generate batch embeddings
    texts = [item["text"] for item in items_to_embed]
    logger.info(f"Requesting batch embeddings for {len(texts)} items from OpenAI Embedding Service...")
    vectors = embedding_service.get_embeddings(texts)

    points: List[PointStruct] = []
    for idx, (item, vector) in enumerate(zip(items_to_embed, vectors), start=1):
        points.append(PointStruct(
            id=idx,
            vector=vector,
            payload=item["payload"]
        ))

    # 3. Upsert points into Qdrant in batch
    logger.info(f"Upserting {len(points)} vector points into Qdrant collection '{COLLECTION_NAME}'...")
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    logger.info(f"Successfully seeded {len(points)} vectors (Subjects + CLOs) into Qdrant!")

    # Verify collection count
    collection_info = client.get_collection(collection_name=COLLECTION_NAME)
    logger.info(f"Verification: Collection '{COLLECTION_NAME}' now contains {collection_info.points_count} points.")


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else os.getenv("QDRANT_URL", "http://localhost:6333")
    seed_qdrant(qdrant_url=target_url)
