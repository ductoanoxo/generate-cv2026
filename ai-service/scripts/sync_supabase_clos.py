import os
import sys
import docx
import psycopg2
import logging
from typing import List, Dict, Any

# Ensure app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings
from app.services.jd_parser_service import jd_parser_service
from app.services.embedding_service import embedding_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

CLO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "CLO"))

# Template CLO details generator for IT subjects queried from Supabase
SUBJECT_CLO_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "502CNLT25": {
        "knowledge": [
            "Xác định các thành phần cần bảo mật cho một hệ thống thông tin, trình bày các hình thức và tình huống tấn công mạng.",
            "Mô tả cách thức mã hóa thông tin cổ điển và hiện đại, xây dựng kiến trúc mạng sử dụng tường lửa và phân loại virus thông dụng."
        ],
        "skills": [
            "Thiết lập các cách thức bảo mật, cấu hình và xây dựng các chính sách bảo mật mạng, dựng tường lửa bảo vệ hệ thống.",
            "Cài đặt phần mềm chống virus, thiết lập cấu hình an toàn hệ thống và giám sát lưu lượng mạng phòng ngừa xâm nhập."
        ],
        "autonomy": [
            "Tác phong công nghiệp, tuân thủ kỷ luật an toàn thông tin, cẩn thận, tự giác và nghiêm túc trong công việc quản trị mạng."
        ]
    },
    "502CNTH15": {
        "knowledge": [
            "Nắm vững chuẩn HTML5, CSS3, JavaScript ES6+, giao thức HTTP/HTTPS và nguyên lý hoạt động của kiến trúc Client-Server.",
            "Trình bày được mô hình Single Page Application (SPA), RESTful API và cơ chế bất đồng bộ (Asynchronous JS)."
        ],
        "skills": [
            "Xây dựng giao diện web Responsive phù hợp đa thiết bị, sử dụng CSS Grid, Flexbox và thư viện UI modern (Tailwind, React).",
            "Phát triển ứng dụng Web SPA, xử lý state management và gọi REST API kết nối cơ sở dữ liệu Backend."
        ],
        "autonomy": [
            "Khả năng làm việc nhóm Agile/Scrum, quản lý mã nguồn bằng Git, tuân thủ tiêu chuẩn code sạch (Clean Code)."
        ]
    },
    "502CSTH08": {
        "knowledge": [
            "Hiểu mô hình thực thể mối quan hệ ERD, các đại số quan hệ và các quy tắc chuẩn hóa dữ liệu 1NF, 2NF, 3NF, BCNF.",
            "Mô tả cấu trúc Index, Transaction, Concurrency Control và cơ chế khóa trong RDBMS."
        ],
        "skills": [
            "Viết câu lệnh SQL thành thạo DDL, DML, Subquery, Join, Aggregate functions, Stored Procedure và Trigger.",
            "Thiết kế Index tối ưu hiệu năng truy vấn CSDL PostgreSQL/SQL Server, xử lý Backup/Restore dữ liệu."
        ],
        "autonomy": [
            "Cẩn trọng trong thao tác dữ liệu production, bảo vệ toàn vẹn và an toàn dữ liệu doanh nghiệp."
        ]
    },
    "502CNTH18": {
        "knowledge": [
            "Hiểu rõ các tầng mô hình OSI/TCP-IP, địa chỉ IP Subnetting, các giao thức DNS, DHCP, FTP, SSH, BGP, OSPF.",
            "Trình bày được các mô hình phân quyền và bảo mật trên hệ điều hành Linux/Windows Server."
        ],
        "skills": [
            "Cấu hình thiết bị mạng Switch/Router Cisco, chia VLAN, thiết lập VPN và định tuyến luồng dữ liệu.",
            "Quản trị máy chủ Linux (Ubuntu/Debian), phân quyền SSH, cài đặt Nginx/Apache, cấu hình Bash Script tự động hóa."
        ],
        "autonomy": [
            "Chủ động phát hiện sự cố mạng, giám sát hạ tầng 24/7, đảm bảo tính sẵn sàng của hạ tầng hệ thống."
        ]
    },
    "502CNTH16K25": {
        "knowledge": [
            "Nắm vững 4 tính chất OOP (Đóng gói Encapsulation, Kế thừa Inheritance, Đa hình Polymorphism, Trừu tượng Abstraction).",
            "Mô tả các nguyên lý thiết kế SOLID và các Design Patterns phổ biến trong phát triển phần mềm."
        ],
        "skills": [
            "Vẽ sơ đồ lớp UML, thiết kế Interface, Abstract class và triển khai các Design Patterns (Singleton, Factory, Observer).",
            "Viết mã nguồn C#/.NET hoặc Java chuẩn SOLID principles, sử dụng Generics, Exception Handling và LINQ."
        ],
        "autonomy": [
            "Tự nghiên cứu framework mới, kiên trì refactor code tối ưu kiến trúc phần mềm."
        ]
    },
    "502CSTH10": {
        "knowledge": [
            "Hiểu cấu trúc mảng, danh sách liên kết (LinkedList), Ngăn xếp Stack, Hàng đợi Queue, Cây Binary Search Tree, Đồ thị Graph.",
            "Trình bày các thuật toán Sắp xếp, Tìm kiếm, Đồ thị và cơ chế đánh giá độ phức tạp thuật toán."
        ],
        "skills": [
            "Cài đặt các thuật toán Sắp xếp (QuickSort, MergeSort), Tìm kiếm (Binary Search), Đồ thị (Dijkstra, BFS, DFS).",
            "Đánh giá độ phức tạp thời gian Big-O và bộ nhớ của thuật toán, tối ưu bài toán xử lý dữ liệu lớn."
        ],
        "autonomy": [
            "Tư duy logic giải thuật chặt chẽ, rèn luyện kỹ năng giải quyết bài toán phức tạp."
        ]
    },
    "502CNTH16": {
        "knowledge": [
            "Hiểu vòng đời ứng dụng Mobile (App Lifecycle), cơ chế Render, Navigation, Async Storage và Push Notifications.",
            "Mô tả mô hình kết nối Backend API và lưu trữ dữ liệu cục bộ SQLite/Firebase."
        ],
        "skills": [
            "Lập trình ứng dụng di động đa nền tảng bằng React Native / Flutter, thiết kế UI mượt mà theo chuẩn Material / HIG.",
            "Tích hợp Camera, GPS, Lưu trữ cục bộ SQLite/AsyncStorage, kết nối Backend API và xác thực OAuth/JWT."
        ],
        "autonomy": [
            "Chú trọng trải nghiệm người dùng Mobile (UX), kiểm thử ứng dụng trên thiết bị thực trước khi publish Store."
        ]
    },
    "502CSTH09": {
        "knowledge": [
            "Hiểu các quy trình phát triển phần mềm (Waterfall, Agile, Scrum), mô hình Microservices và Monolith.",
            "Trình bày quy trình thu thập yêu cầu và tài liệu hóa kiến trúc hệ thống phần mềm."
        ],
        "skills": [
            "Thu thập yêu cầu bài toán kinh doanh, viết tài liệu Software Requirement Specification (SRS) và User Story.",
            "Sử dụng công cụ thiết kế UML vẽ Use Case Diagram, Sequence Diagram, Class Diagram, Activity Diagram."
        ],
        "autonomy": [
            "Kỹ năng giao tiếp và làm việc với các bên liên quan (Stakeholders), tư duy kiến trúc hệ thống tổng quát."
        ]
    },
    "502CNTH20": {
        "knowledge": [
            "Hiểu khái niệm Containerization, Orchestration, CI/CD, các dịch vụ Cloud AWS (EC2, S3, RDS) hoặc Supabase/Docker.",
            "Mô tả hạ tầng như mã (Infrastructure as Code) và tự động hóa deployment."
        ],
        "skills": [
            "Viết Dockerfile tối ưu, compose ứng dụng multi-container bằng docker-compose.yml và quản lý biến môi trường.",
            "Xây dựng luồng tự động hóa CI/CD bằng GitHub Actions / GitLab CI, tự động kiểm thử và deploy sản phẩm."
        ],
        "autonomy": [
            "Đảm bảo độ sẵn sàng (High Availability), giám sát tài nguyên máy chủ và bảo mật thông số môi trường."
        ]
    },
    "502CNTH13": {
        "knowledge": [
            "Hiểu nguyên lý cơ bản của AI, Machine Learning (Supervised/Unsupervised), Neural Networks, Vector Embedding và RAG.",
            "Trình bày nguyên lý hoạt động của Vector Database Qdrant và các mô hình LLM hiện đại."
        ],
        "skills": [
            "Sử dụng Python, NumPy, Pandas, Scikit-Learn tiền xử lý dữ liệu và xây dựng mô hình phân loại dữ liệu.",
            "Sử dụng OpenAI Embedding API (`text-embedding-3-small`), nạp dữ liệu vector vào Qdrant và thực hiện Semantic Vector Search."
        ],
        "autonomy": [
            "Tư duy đổi mới sáng tạo, cập nhật liên tục các nghiên cứu và sản phẩm AI tiên tiến."
        ]
    },
    "502CNTH21": {
        "knowledge": [
            "Hiểu khái niệm Supervised Learning, Unsupervised Learning, Feature Engineering và các chỉ số đánh giá Accuracy, Precision, Recall.",
            "Mô tả thuật toán Regression, Decision Tree, Random Forest, K-Means Clustering và SVM."
        ],
        "skills": [
            "Sử dụng Scikit-Learn huấn luyện mô hình Machine Learning, tinh chỉnh Hyperparameter và tối ưu Overfitting/Underfitting.",
            "Trực quan hóa dữ liệu và kết quả dự đoán mô hình bằng Matplotlib, Seaborn."
        ],
        "autonomy": [
            "Tư duy phân tích dữ liệu khách quan, cẩn thận trong việc chia dataset Train/Test."
        ]
    },
    "502CSTH07": {
        "knowledge": [
            "Hiểu cú pháp câu lệnh lập trình cơ bản, kiểu dữ liệu, biến, cấu trúc rẽ nhánh và vòng lặp.",
            "Mô tả nguyên lý hàm, tham số truyền vào, phạm vi biến và mảng."
        ],
        "skills": [
            "Viết thuật toán giải các bài toán tính toán cơ bản bằng ngôn ngữ C/C++ hoặc Python.",
            "Sử dụng IDE debug lỗi cú pháp và lỗi logic."
        ],
        "autonomy": [
            "Rèn luyện tư duy lập trình căn bản, kiên trì sửa lỗi code."
        ]
    },
    "502CNTH24": {
        "knowledge": [
            "Hiểu cú pháp Python nâng cao, thư viện Pandas, NumPy, SciPy và quy trình phân tích dữ liệu chuyên nghiệp.",
            "Mô tả cấu trúc dữ liệu DataFrame, Series và các phép toán biến đổi dữ liệu."
        ],
        "skills": [
            "Thực hiện tiền xử lý dữ liệu bẩn, làm sạch giá trị khuyết (Missing Data) và trích xuất đặc trưng (Feature Extraction).",
            "Xây dựng đường ống dữ liệu (Data Pipeline) xử lý và phân tích tập dữ liệu lớn."
        ],
        "autonomy": [
            "Tác phong làm việc khoa học, trung thực với kết quả phân tích dữ liệu."
        ]
    },
    "502CNTH25": {
        "knowledge": [
            "Hiểu nguyên lý trực quan hóa dữ liệu, thiết kế Dashboard chỉ số và phân tích xu hướng dữ liệu kinh doanh.",
            "Mô tả các dạng biểu đồ (Bar Chart, Line Chart, Heatmap, Scatter Plot) và ngữ cảnh sử dụng."
        ],
        "skills": [
            "Xây dựng Dashboard tương tác trực quan bằng Python (Matplotlib, Seaborn, Plotly) hoặc PowerBI.",
            "Phân tích chỉ số KPI và trình bày báo cáo trực quan cho ban quản trị."
        ],
        "autonomy": [
            "Tư duy thẩm mỹ trực quan dữ liệu, giao tiếp hiệu quả qua biểu đồ."
        ]
    },
    "502CNTH17": {
        "knowledge": [
            "Hiểu kiến trúc Frontend nâng cao, State Management, Server-Side Rendering (SSR) và Web Performance Optimization.",
            "Trình bày các mô hình xác thực JWT, OAuth2 và bảo mật Frontend (XSS, CSRF)."
        ],
        "skills": [
            "Lập trình giao diện Web phức tạp với React/Next.js, TypeScript, TailwindCSS và Redux/Zustand.",
            "Tối ưu tốc độ tải trang Web, cải thiện chỉ số Core Web Vitals."
        ],
        "autonomy": [
            "Tự học công nghệ Frontend mới, chú trọng trải nghiệm người dùng."
        ]
    }
}


def get_clo_info_for_subject(code: str, name: str) -> Dict[str, Any]:
    if code in SUBJECT_CLO_TEMPLATES:
        return SUBJECT_CLO_TEMPLATES[code]
    return {
        "knowledge": [
            f"Trình bày và giải thích các khái niệm, nguyên lý cơ bản của môn học {name}.",
            f"Nắm vững lý thuyết chuyên ngành và phương pháp áp dụng môn học {name} vào thực tiễn."
        ],
        "skills": [
            f"Vận dụng kỹ năng thực hành môn học {name} để giải quyết các bài toán kỹ thuật chuyên môn.",
            f"Sử dụng công cụ phần mềm và công nghệ hiện đại phục vụ học tập và phát triển môn {name}."
        ],
        "autonomy": [
            f"Thể hiện tinh thần trách nhiệm, chủ động tự học và tuân thủ các quy chuẩn đạo đức nghề nghiệp."
        ]
    }


def fetch_supabase_cntt_subjects() -> List[Dict[str, Any]]:
    """
    Queries exact pre-existing CNTT subjects directly from Supabase PostgreSQL database.
    """
    db_url = settings.DATABASE_URL or os.getenv('DATABASE_URL', '')
    parts = dict(item.split('=', 1) for item in db_url.strip(';').split(';') if '=' in item)
    conn = psycopg2.connect(
        host=parts.get('Server'),
        database=parts.get('Database'),
        user=parts.get('User Id'),
        password=parts.get('Password'),
        port=parts.get('Port', 5432),
        sslmode='require'
    )
    cur = conn.cursor()

    faculty_id = '1f88ffe6-57aa-4d57-af85-fa445cc7ec25' # CNTT Faculty ID

    cur.execute('''
        SELECT "Id", "SubjectCode", "Name", "CreditPoint", "TotalHours"
        FROM "Subjects"
        WHERE "FacultyId" = %s AND "IsDeleted" = false
        ORDER BY "SubjectCode";
    ''', (faculty_id,))

    rows = cur.fetchall()
    subjects = []
    # Ignore obvious junk test rows if any
    ignored_codes = {"test", "c", "mh 01", "sz"}

    for r in rows:
        code = r[1].strip()
        name = r[2].strip()
        if code.lower() in ignored_codes or name.lower() in ignored_codes:
            continue

        subjects.append({
            "id": str(r[0]),
            "subject_code": code,
            "subject_name": name,
            "credits": r[3] or 3,
            "hours": r[4] or 45,
            "department": "Khoa Công Nghệ Thông Tin",
            "clo_info": get_clo_info_for_subject(code, name)
        })
    cur.close()
    conn.close()
    return subjects


import unicodedata
import re

def sanitize_name(text: str) -> str:
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.replace('Đ', 'D').replace('đ', 'd')
    words = re.findall(r'[a-zA-Z0-9]+', text)
    return ''.join(word.capitalize() for word in words)


def generate_clo_docx(subject: dict):
    code = subject["subject_code"]
    name = subject["subject_name"]
    hours = subject["hours"]
    
    clean_name = sanitize_name(name)
    clean_code = re.sub(r'[^a-zA-Z0-9_.-]', '', code)
    filename = f"ChuongTrinh_{clean_name}_{clean_code}.docx"
    file_path = os.path.join(CLO_DIR, filename)

    doc = docx.Document()

    # Header Title
    p_title = doc.add_paragraph()
    p_title.add_run("CHƯƠNG TRÌNH MÔN HỌC").bold = True

    p_name = doc.add_paragraph()
    p_name.add_run(f"Tên môn học: {name}").bold = True
    doc.add_paragraph(f"Mã môn học: {code}")
    doc.add_paragraph(f"Thời gian thực hiện môn học: {hours} giờ; (Lý thuyết: {int(hours*0.6)} giờ; Thực hành, thí nghiệm: {int(hours*0.4)} giờ; Kiểm tra: 3 giờ)")

    # Section I
    doc.add_paragraph()
    p_sec1 = doc.add_paragraph()
    p_sec1.add_run("I. VỊ TRÍ, TÍNH CHẤT CỦA MÔN HỌC:").bold = True
    doc.add_paragraph("- Vị trí: Môn học được bố trí sau khi sinh viên học xong các môn học chung cơ sở chuyên ngành đào tạo chuyên môn nghề.")
    doc.add_paragraph("- Tính chất: Là môn học chuyên ngành thuộc Khoa Công Nghệ Thông Tin trong CSDL Supabase.")

    # Section II - CLOs
    doc.add_paragraph()
    p_sec2 = doc.add_paragraph()
    p_sec2.add_run("II. MỤC TIÊU MÔN HỌC:").bold = True
    doc.add_paragraph("Sau khi học xong chương trình môn học người học có năng lực:")

    clo_info = subject["clo_info"]

    doc.add_paragraph("- Về kiến thức:")
    for k in clo_info["knowledge"]:
        doc.add_paragraph(f"+ {k}")

    doc.add_paragraph("- Về kỹ năng:")
    for s in clo_info["skills"]:
        doc.add_paragraph(f"+ {s}")

    doc.add_paragraph("- Về năng lực tự chủ và trách nhiệm:")
    for a in clo_info["autonomy"]:
        doc.add_paragraph(f"+ {a}")

    doc.save(file_path)
    logger.info(f"Generated CLO docx for Supabase subject: {code} - {name} -> {file_path}")
    return file_path


def main():
    os.makedirs(CLO_DIR, exist_ok=True)
    logger.info("Fetching CNTT subjects directly from Supabase database...")
    supabase_subjects = fetch_supabase_cntt_subjects()
    logger.info(f"Retrieved {len(supabase_subjects)} core IT subjects from Supabase.")

    for sub in supabase_subjects:
        generate_clo_docx(sub)

    logger.info("All CLO docx files generated successfully based on Supabase database!")


if __name__ == "__main__":
    main()
