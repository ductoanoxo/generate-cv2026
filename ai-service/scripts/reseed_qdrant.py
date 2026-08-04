"""Re-seed Qdrant with batch-chunked uploads to avoid 400 errors."""
import os, sys, logging
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from app.config import settings
from app.services.embedding_service import embedding_service
from scripts.sync_supabase_clos import fetch_supabase_cntt_subjects

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

COLLECTION_NAME = "course_clos"

def reseed():
    client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

    # Check current state
    try:
        info = client.get_collection(COLLECTION_NAME)
        logger.info(f"Collection exists: {info.points_count} points")
        if info.points_count and info.points_count > 0:
            logger.info("Collection already has data! Skipping re-seed.")
            return
    except Exception:
        logger.info("Collection does not exist, creating...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
        )

    # Fetch subjects
    subjects = fetch_supabase_cntt_subjects()
    logger.info(f"Fetched {len(subjects)} subjects from Supabase")

    # Build items
    items = []
    for subject in subjects:
        sub_code = subject["subject_code"]
        sub_name = subject["subject_name"]
        sub_desc = f"Môn học chuyên ngành Khoa CNTT Supabase: {sub_name} ({sub_code})."
        dept = subject["department"]

        subject_text = f"Môn học: {sub_name} ({sub_code}). Mô tả: {sub_desc}. Khoa: {dept}."
        items.append({
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
            items.append({
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

    logger.info(f"Total items to embed: {len(items)}")

    # Embed in small batches (avoid OpenRouter rate limits)
    EMBED_BATCH = 20
    all_vectors = []
    for i in range(0, len(items), EMBED_BATCH):
        batch_texts = [it["text"] for it in items[i:i+EMBED_BATCH]]
        logger.info(f"  Embedding batch {i//EMBED_BATCH + 1}/{(len(items)-1)//EMBED_BATCH + 1} ({len(batch_texts)} texts)...")
        vectors = embedding_service.get_embeddings(batch_texts)
        all_vectors.extend(vectors)

    # Upload in small batches
    UPLOAD_BATCH = 50
    total_uploaded = 0
    for i in range(0, len(items), UPLOAD_BATCH):
        batch_points = []
        for j, (item, vector) in enumerate(zip(items[i:i+UPLOAD_BATCH], all_vectors[i:i+UPLOAD_BATCH])):
            batch_points.append(PointStruct(
                id=i + j + 1,
                vector=vector,
                payload=item["payload"]
            ))
        client.upsert(collection_name=COLLECTION_NAME, points=batch_points)
        total_uploaded += len(batch_points)
        logger.info(f"  Uploaded batch: {total_uploaded}/{len(items)} points")

    # Verify
    info = client.get_collection(COLLECTION_NAME)
    logger.info(f"DONE! Collection '{COLLECTION_NAME}' now has {info.points_count} points.")

if __name__ == "__main__":
    reseed()
