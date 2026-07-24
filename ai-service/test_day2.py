import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config import settings
from app.services.jd_parser_service import jd_parser_service
from app.services.embedding_service import embedding_service
from scripts.seed_vectors import seed_qdrant, COLLECTION_NAME
from qdrant_client import QdrantClient

class TestDay2Pipeline(unittest.TestCase):
    
    def test_01_jd_parser_service(self):
        print("\n--- Testing 1. JD Parser Service ---")
        docx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "CLO", "ChuongTrinh_AnToanBaoMatThongTin.docx"))
        self.assertTrue(os.path.exists(docx_path), f"File {docx_path} does not exist.")
        
        parsed_md = jd_parser_service.parse_file(docx_path, filename="ChuongTrinh_AnToanBaoMatThongTin.docx")
        print(f"Parsed Markdown Preview (first 200 chars):\n{parsed_md[:200]}...")
        self.assertIsNotNone(parsed_md)
        self.assertTrue(len(parsed_md) > 100, "Parsed markdown should not be empty.")
        self.assertIn("An toàn và bảo mật thông tin", parsed_md)

    def test_02_embedding_service(self):
        print("\n--- Testing 2. OpenAI Embedding Service ---")
        sample_text = "Môn học An toàn và bảo mật thông tin thuộc Khoa CNTT."
        vector = embedding_service.get_embedding(sample_text)
        print(f"Generated Vector Dimension: {len(vector)}")
        self.assertEqual(len(vector), 1536, "Embedding dimension must be 1536 for text-embedding-3-small.")

    def test_03_seed_qdrant(self):
        print("\n--- Testing 3. Seed Qdrant Vectors ---")
        client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        try:
            collection_info = client.get_collection(collection_name=COLLECTION_NAME)
            point_count = collection_info.points_count
        except Exception:
            point_count = 0

        if point_count == 0:
            print("Collection is empty or does not exist, running seed...")
            seed_qdrant(settings.QDRANT_URL)
            collection_info = client.get_collection(collection_name=COLLECTION_NAME)
            point_count = collection_info.points_count
        else:
            print(f"Collection '{COLLECTION_NAME}' already has {point_count} points, skipping seed.")
            
        print(f"Qdrant collection '{COLLECTION_NAME}' point count: {point_count}")
        self.assertGreater(point_count, 0, "Qdrant collection should contain points.")

        # Perform a search query to verify Qdrant vector search
        query_text = "lập trình web và giao diện"
        query_vector = embedding_service.get_embedding(query_text)
        
        # Use query_points for qdrant-client v1.18+
        search_results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=3
        ).points

        print("\nTop 3 Qdrant search results for 'lập trình web và giao diện':")
        for res in search_results:
            payload = res.payload or {}
            print(f" - Score: {res.score:.4f} | Code: {payload.get('subject_code')} | Name: {payload.get('subject_name')} | Content: {payload.get('content', payload.get('full_text', ''))[:100]}")
        self.assertGreater(len(search_results), 0)

if __name__ == "__main__":
    unittest.main()
