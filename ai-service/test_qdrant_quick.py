from app.services.vector_search_service import vector_search_service
from app.services.embedding_service import embedding_service
from app.config import settings

print("=== DIAGNOSTIC ===")
print(f"QDRANT_URL: {settings.QDRANT_URL}")
print(f"OPENAI_KEY prefix: {settings.OPENAI_API_KEY[:15] if settings.OPENAI_API_KEY else 'NONE'}...")

# 1. Check Qdrant collection
try:
    info = vector_search_service.qdrant_client.get_collection("course_clos")
    print(f"\nCollection 'course_clos': {info.points_count} points, vector size={info.config.params.vectors.size}")
except Exception as e:
    print(f"\nCollection ERROR: {type(e).__name__}: {e}")

# 2. Check embedding works
try:
    emb = embedding_service.get_embedding("test Docker")
    print(f"\nEmbedding OK: dim={len(emb)}, first 5 values={emb[:5]}")
except Exception as e:
    print(f"\nEmbedding ERROR: {type(e).__name__}: {e}")

# 3. Try raw scroll to see if points exist
try:
    scroll_res = vector_search_service.qdrant_client.scroll(
        collection_name="course_clos",
        limit=3,
        with_payload=True,
        with_vectors=False
    )
    points = scroll_res[0]
    print(f"\nScroll got {len(points)} points:")
    for p in points:
        print(f"  id={p.id} | {p.payload.get('subject_code','?')} | {p.payload.get('subject_name','?')} | type={p.payload.get('type','?')}")
except Exception as e:
    print(f"\nScroll ERROR: {type(e).__name__}: {e}")
