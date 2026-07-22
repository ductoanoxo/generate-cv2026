import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app

client = TestClient(app)

def test_api_endpoints():
    print("\n--- Testing API Endpoints ---")
    
    # 1. Health Endpoint
    res_health = client.get("/health")
    print(f"GET /health -> Status {res_health.status_code}: {res_health.json()}")
    assert res_health.status_code == 200

    # 2. Embed Endpoint (/api/embed)
    embed_payload = {"text": "Kỹ năng lập trình React và C# .NET Backend"}
    res_embed = client.post("/api/embed", json=embed_payload)
    print(f"POST /api/embed -> Status {res_embed.status_code}")
    assert res_embed.status_code == 200
    json_embed = res_embed.json()
    assert json_embed["status"] == "success"
    assert json_embed["dimension"] == 1536
    assert len(json_embed["embedding"]) == 1536
    print(f" -> Embedding dimension verified: {json_embed['dimension']}")

    # 3. Parse JD Endpoint (/api/parse-jd) with Raw Text Form
    res_parse_text = client.post("/api/parse-jd", data={"raw_text": "# Job Description\nWe need a Senior Fullstack Developer."})
    print(f"POST /api/parse-jd (text) -> Status {res_parse_text.status_code}")
    assert res_parse_text.status_code == 200
    assert "Senior Fullstack Developer" in res_parse_text.json()["markdown"]

    # 4. Parse JD Endpoint (/api/parse-jd) with File Upload
    file_path = "/home/traductoan/generate-cv/CLO/ChuongTrinh_AnToanBaoMatThongTin.docx"
    with open(file_path, "rb") as f:
        res_parse_file = client.post(
            "/api/parse-jd",
            files={"file": ("ChuongTrinh_AnToanBaoMatThongTin.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        )
    print(f"POST /api/parse-jd (file upload) -> Status {res_parse_file.status_code}")
    assert res_parse_file.status_code == 200
    json_parse_file = res_parse_file.json()
    assert json_parse_file["status"] == "success"
    assert "An toàn và bảo mật thông tin" in json_parse_file["markdown"]
    print(" -> File upload JD parsing verified successfully!")

if __name__ == "__main__":
    test_api_endpoints()
    print("\nALL API ENDPOINT TESTS PASSED SUCCESSFULLY!")
