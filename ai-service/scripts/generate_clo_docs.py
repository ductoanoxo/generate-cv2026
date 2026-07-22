import os
import sys
import docx

CLO_DIR = "/home/traductoan/generate-cv/CLO"

SUPABASE_CNTT_COURSES = [
    {
        "filename": "ChuongTrinh_ThietKeVaQuanTriWebsite.docx",
        "subject_name": "Thiết kế và quản trị website",
        "subject_code": "502CNTH15",
        "hours": "75 giờ; (Lý thuyết: 30 giờ; Thực hành: 42 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Nắm vững chuẩn HTML5, CSS3, JavaScript ES6+, giao thức HTTP/HTTPS và nguyên lý hoạt động của kiến trúc Client-Server.",
            "Trình bày được mô hình Single Page Application (SPA), RESTful API và cơ chế bất đồng bộ (Asynchronous JS)."
        ],
        "skills": [
            "Xây dựng giao diện web Responsive phù hợp đa thiết bị, sử dụng CSS Grid, Flexbox và thư viện UI modern (Tailwind, React).",
            "Phát triển ứng dụng Web SPA, xử lý state management và gọi REST API kết nối cơ sở dữ liệu Backend."
        ],
        "autonomy": [
            "Khả năng làm việc nhóm Agile/Scrum, quản lý mã nguồn bằng Git, tuân thủ tiêu chuẩn code sạch (Clean Code).",
            "Tự giác học hỏi framework web mới, cẩn thận trong việc bảo mật dữ liệu phía client."
        ],
        "chapters": [
            ("Chương 1: Tổng quan về Web & HTML5/CSS3", 15),
            ("Chương 2: Lập trình JavaScript ES6+ & DOM Manipulation", 20),
            ("Chương 3: Xây dựng UI Component với React.js", 20),
            ("Chương 4: Tích hợp RESTful API & State Management", 20)
        ]
    },
    {
        "filename": "ChuongTrinh_CoSoDuLieu.docx",
        "subject_name": "Cơ sở dữ liệu",
        "subject_code": "502CSTH08",
        "hours": "45 giờ; (Lý thuyết: 25 giờ; Thực hành: 17 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu mô hình thực thể mối quan hệ ERD, các đại số quan hệ và các quy tắc chuẩn hóa dữ liệu 1NF, 2NF, 3NF, BCNF.",
            "Mô tả cấu trúc Index, Transaction, Concurrency Control và cơ chế khóa trong RDBMS."
        ],
        "skills": [
            "Viết câu lệnh SQL thành thạo DDL, DML, Subquery, Join, Aggregate functions, Stored Procedure và Trigger.",
            "Thiết kế Index tối ưu hiệu năng truy vấn CSDL PostgreSQL/SQL Server, xử lý Backup/Restore dữ liệu."
        ],
        "autonomy": [
            "Cẩn trọng trong thao tác dữ liệu production, bảo vệ toàn vẹn và an toàn dữ liệu doanh nghiệp.",
            "Nghiêm túc trong công việc quản trị CSDL, tác phong làm việc chuẩn mực."
        ],
        "chapters": [
            ("Chương 1: Mô hình ERD và Chuẩn hóa Cơ sở dữ liệu", 10),
            ("Chương 2: Ngôn ngữ truy vấn SQL từ cơ bản đến nâng cao", 15),
            ("Chương 3: Stored Procedure, Trigger và Transaction", 10),
            ("Chương 4: Tối ưu hóa truy vấn & Quản trị CSDL", 10)
        ]
    },
    {
        "filename": "ChuongTrinh_QuanTriMangMayTinh.docx",
        "subject_name": "Quản trị mạng máy tính",
        "subject_code": "502CNTH18",
        "hours": "75 giờ; (Lý thuyết: 30 giờ; Thực hành: 42 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu rõ các tầng mô hình OSI/TCP-IP, địa chỉ IP Subnetting, các giao thức DNS, DHCP, FTP, SSH, BGP, OSPF.",
            "Trình bày được các mô hình phân quyền và bảo mật trên hệ điều hành Linux/Windows Server."
        ],
        "skills": [
            "Cấu hình thiết bị mạng Switch/Router Cisco, chia VLAN, thiết lập VPN và định tuyến luồng dữ liệu.",
            "Quản trị máy chủ Linux (Ubuntu/Debian), phân quyền SSH, cài đặt Nginx/Apache, cấu hình Bash Script tự động hóa."
        ],
        "autonomy": [
            "Chủ động phát hiện sự cố mạng, giám sát hạ tầng 24/7, đảm bảo tính sẵn sàng của hạ tầng hệ thống.",
            "Cẩn thận, tuân thủ quy trình vận hành hệ thống thông tin."
        ],
        "chapters": [
            ("Chương 1: Tổng quan Mô hình OSI và TCP/IP", 15),
            ("Chương 2: Địa chỉ IP Subnetting & Cấu hình Router/Switch", 20),
            ("Chương 3: Quản trị Máy chủ Linux & Nginx Web Server", 20),
            ("Chương 4: Giám sát Mạng & Tự động hóa với Bash Script", 20)
        ]
    },
    {
        "filename": "ChuongTrinh_LapTrinhHuongDoiTuong.docx",
        "subject_name": "Lập trình hướng đối tượng",
        "subject_code": "502CNTH16K25",
        "hours": "60 giờ; (Lý thuyết: 30 giờ; Thực hành: 27 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Nắm vững 4 tính chất OOP (Đóng gói Encapsulation, Kế thừa Inheritance, Đa hình Polymorphism, Trừu tượng Abstraction).",
            "Mô tả các nguyên lý thiết kế SOLID và các Design Patterns phổ biến trong phát triển phần mềm."
        ],
        "skills": [
            "Vẽ sơ đồ lớp UML, thiết kế Interface, Abstract class và triển khai các Design Patterns (Singleton, Factory, Observer).",
            "Viết mã nguồn C#/.NET hoặc Java chuẩn SOLID principles, sử dụng Generics, Exception Handling và LINQ."
        ],
        "autonomy": [
            "Tự nghiên cứu framework mới, kiên trì refactor code tối ưu kiến trúc phần mềm.",
            "Trách nhiệm cao với chất lượng mã nguồn do mình viết ra."
        ],
        "chapters": [
            ("Chương 1: Khái niệm OOP & 4 Tính chất Cơ bản", 15),
            ("Chương 2: Sơ đồ Lớp UML & Thiết kế Interface/Abstract Class", 15),
            ("Chương 3: Nguyên lý SOLID & Lập trình C#/.NET / Java Nâng cao", 15),
            ("Chương 4: Áp dụng Design Patterns trong dự án phần mềm", 15)
        ]
    },
    {
        "filename": "ChuongTrinh_CauTrucDuLieuVaGiaiThuat.docx",
        "subject_name": "Cấu trúc dữ liệu và giải thuật",
        "subject_code": "502CSTH10",
        "hours": "45 giờ; (Lý thuyết: 25 giờ; Thực hành: 17 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu cấu trúc mảng, danh sách liên kết (LinkedList), Ngăn xếp Stack, Hàng đợi Queue, Cây Binary Search Tree, Đồ thị Graph.",
            "Trình bày các thuật toán Sắp xếp, Tìm kiếm, Đồ thị và cơ chế đánh giá độ phức tạp thuật toán."
        ],
        "skills": [
            "Cài đặt các thuật toán Sắp xếp (QuickSort, MergeSort), Tìm kiếm (Binary Search), Đồ thị (Dijkstra, BFS, DFS).",
            "Đánh giá độ phức tạp thời gian Big-O và bộ nhớ của thuật toán, tối ưu bài toán xử lý dữ liệu lớn."
        ],
        "autonomy": [
            "Tư duy logic giải thuật chặt chẽ, rèn luyện kỹ năng giải quyết bài toán phức tạp.",
            "Tự giác luyện tập giải thuật trên các nền tảng lập trình."
        ],
        "chapters": [
            ("Chương 1: Đánh giá Thuật toán Big-O & Mảng / LinkedList", 10),
            ("Chương 2: Stack, Queue & Cây Tìm kiếm Nhị phân (BST)", 12),
            ("Chương 3: Thuật toán Sắp xếp Nâng cao & Tìm kiếm", 11),
            ("Chương 4: Thuật toán Đồ thị (BFS, DFS, Dijkstra)", 12)
        ]
    },
    {
        "filename": "ChuongTrinh_PhatTrienPhanMemChoThietBiDiDong.docx",
        "subject_name": "Phát triển phần mềm cho thiết bị di động",
        "subject_code": "502CNTH16",
        "hours": "75 giờ; (Lý thuyết: 30 giờ; Thực hành: 42 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu vòng đời ứng dụng Mobile (App Lifecycle), cơ chế Render, Navigation, Async Storage và Push Notifications.",
            "Mô tả mô hình kết nối Backend API và lưu trữ dữ liệu cục bộ SQLite/Firebase."
        ],
        "skills": [
            "Lập trình ứng dụng di động đa nền tảng bằng React Native / Flutter, thiết kế UI mượt mà theo chuẩn Material / HIG.",
            "Tích hợp Camera, GPS, Lưu trữ cục bộ SQLite/AsyncStorage, kết nối Backend API và xác thực OAuth/JWT."
        ],
        "autonomy": [
            "Chú trọng trải nghiệm người dùng Mobile (UX), kiểm thử ứng dụng trên thiết bị thực trước khi publish Store.",
            "Chủ động cập nhật xu hướng công nghệ lập trình di động."
        ],
        "chapters": [
            ("Chương 1: Tổng quan Mobile App & Cấu trúc React Native/Flutter", 15),
            ("Chương 2: Thiết kế UI/UX Responsive & Component Navigation", 20),
            ("Chương 3: Tích hợp API Backend, Authentication & Local Storage", 20),
            ("Chương 4: Sử dụng Hardware Features (Camera, GPS) & Build App", 20)
        ]
    },
    {
        "filename": "ChuongTrinh_PhanTichVaThietKeHeThongThongTin.docx",
        "subject_name": "Phân tích và thiết kế hệ thống thông tin",
        "subject_code": "502CSTH09",
        "hours": "45 giờ; (Lý thuyết: 27 giờ; Thực hành: 15 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu các quy trình phát triển phần mềm (Waterfall, Agile, Scrum), mô hình Microservices và Monolith.",
            "Trình bày quy trình thu thập yêu cầu và tài liệu hóa kiến trúc hệ thống phần mềm."
        ],
        "skills": [
            "Thu thập yêu cầu bài toán kinh doanh, viết tài liệu Software Requirement Specification (SRS) và User Story.",
            "Sử dụng công cụ thiết kế UML vẽ Use Case Diagram, Sequence Diagram, Class Diagram, Activity Diagram."
        ],
        "autonomy": [
            "Kỹ năng giao tiếp và làm việc với các bên liên quan (Stakeholders), tư duy kiến trúc hệ thống tổng quát.",
            "Nghiêm túc, trách nhiệm trong việc bàn giao tài liệu kỹ thuật."
        ],
        "chapters": [
            ("Chương 1: Tổng quan Quy trình Phần mềm & Agile/Scrum", 10),
            ("Chương 2: Phân tích Yêu cầu & Viết tài liệu SRS/User Story", 10),
            ("Chương 3: Thiết kế Hệ thống bằng Sơ đồ UML", 15),
            ("Chương 4: Kiến trúc Phần mềm Microservices & Database Design", 10)
        ]
    },
    {
        "filename": "ChuongTrinh_DienToanDamMay.docx",
        "subject_name": "Điện toán đám mây",
        "subject_code": "502CNTH20",
        "hours": "60 giờ; (Lý thuyết: 30 giờ; Thực hành: 27 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu khái niệm Containerization, Orchestration, CI/CD, các dịch vụ Cloud AWS (EC2, S3, RDS) hoặc Supabase/Docker.",
            "Mô tả hạ tầng như mã (Infrastructure as Code) và tự động hóa deployment."
        ],
        "skills": [
            "Viết Dockerfile tối ưu, compose ứng dụng multi-container bằng docker-compose.yml và quản lý biến môi trường.",
            "Xây dựng luồng tự động hóa CI/CD bằng GitHub Actions / GitLab CI, tự động kiểm thử và deploy sản phẩm."
        ],
        "autonomy": [
            "Đảm bảo độ sẵn sàng (High Availability), giám sát tài nguyên máy chủ và bảo mật thông số môi trường.",
            "Tác phong kỹ sư DevOps chuyên nghiệp, cẩn trọng với hệ thống Production."
        ],
        "chapters": [
            ("Chương 1: Tổng quan Cloud Computing & Containerization với Docker", 15),
            ("Chương 2: Đóng gói Multi-Container với Docker Compose", 15),
            ("Chương 3: Xây dựng Pipeline CI/CD với GitHub Actions", 15),
            ("Chương 4: Triển khai & Giám sát Ứng dụng trên Cloud Server", 15)
        ]
    },
    {
        "filename": "ChuongTrinh_TriTueNhanTao.docx",
        "subject_name": "Trí tuệ nhân tạo",
        "subject_code": "502CNTH13",
        "hours": "75 giờ; (Lý thuyết: 35 giờ; Thực hành: 37 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu nguyên lý cơ bản của AI, Machine Learning (Supervised/Unsupervised), Neural Networks, Vector Embedding và RAG.",
            "Trình bày nguyên lý hoạt động của Vector Database Qdrant và các mô hình LLM hiện đại."
        ],
        "skills": [
            "Sử dụng Python, NumPy, Pandas, Scikit-Learn tiền xử lý dữ liệu và xây dựng mô hình phân loại dữ liệu.",
            "Sử dụng OpenAI Embedding API (`text-embedding-3-small`), nạp dữ liệu vector vào Qdrant và thực hiện Semantic Vector Search."
        ],
        "autonomy": [
            "Tư duy đổi mới sáng tạo, cập nhật liên tục các nghiên cứu và sản phẩm AI tiên tiến.",
            "Chủ động ứng dụng AI giải quyết các bài toán phần mềm thực tế."
        ],
        "chapters": [
            ("Chương 1: Tổng quan AI & Nhập môn Machine Learning với Python", 15),
            ("Chương 2: Tiền xử lý Dữ liệu với NumPy & Pandas", 20),
            ("Chương 3: Vector Embeddings & Quản trị Vector DB Qdrant", 20),
            ("Chương 4: Tích hợp RAG Pipeline & OpenAI API vào Ứng dụng", 20)
        ]
    },
    {
        "filename": "ChuongTrinh_KyThuatMachineLearningCoBan.docx",
        "subject_name": "Kỹ thuật Machine Learning cơ bản",
        "subject_code": "502CNTH21",
        "hours": "60 giờ; (Lý thuyết: 30 giờ; Thực hành: 27 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu khái niệm Supervised Learning, Unsupervised Learning, Feature Engineering và Model Evaluation metrics (Accuracy, Precision, Recall, F1).",
            "Mô tả thuật toán Regression, Decision Tree, Random Forest, K-Means Clustering và Support Vector Machine (SVM)."
        ],
        "skills": [
            "Sử dụng Scikit-Learn huấn luyện mô hình Machine Learning, tinh chỉnh Hyperparameter và tối ưu Overfitting/Underfitting.",
            "Trực quan hóa dữ liệu và kết quả dự đoán mô hình bằng Matplotlib, Seaborn."
        ],
        "autonomy": [
            "Tư duy phân tích dữ liệu khách quan, cẩn thận trong việc chia dataset Train/Test.",
            "Kiên trì thử nghiệm các thuật toán để tìm ra mô hình tối ưu."
        ],
        "chapters": [
            ("Chương 1: Tiền xử lý dữ liệu & Feature Engineering", 15),
            ("Chương 2: Các thuật toán Học có giám sát (Regression & Classification)", 15),
            ("Chương 3: Thuật toán Học không giám sát (Clustering)", 15),
            ("Chương 4: Đánh giá & Tinh chỉnh Mô hình ML (Model Tuning)", 15)
        ]
    },
    {
        "filename": "ChuongTrinh_LapTrinhCanBan.docx",
        "subject_name": "Lập trình căn bản",
        "subject_code": "502CSTH07",
        "hours": "45 giờ; (Lý thuyết: 25 giờ; Thực hành: 17 giờ; Kiểm tra: 3 giờ)",
        "knowledge": [
            "Hiểu cú pháp câu lệnh lập trình cơ bản, kiểu dữ liệu, biến, hằng, toán tử và cấu trúc điều khiển (if-else, switch-case, for, while).",
            "Mô tả nguyên lý hàm, tham số truyền vào, phạm vi biến và kỹ thuật làm việc với mảng 1 chiều/2 chiều."
        ],
        "skills": [
            "Viết thuật toán giải các bài toán tính toán cơ bản bằng ngôn ngữ C/C++ hoặc Python.",
            "Sử dụng IDE để debug lỗi cú pháp, lỗi logic và tối ưu luồng thực thi chương trình."
        ],
        "autonomy": [
            "Rèn luyện tư duy lập trình căn bản, kiên trì sửa lỗi code.",
            "Tự giác hoàn thành các bài tập lập trình cá nhân."
        ],
        "chapters": [
            ("Chương 1: Tổng quan Ngôn ngữ Lập trình & Cấu trúc Chương trình", 10),
            ("Chương 2: Cấu trúc Rẽ nhánh & Vòng lặp", 12),
            ("Chương 3: Mảng & Chuỗi Ký tự", 13),
            ("Chương 4: Hàm & Con trỏ / Quản lý Bộ nhớ", 10)
        ]
    }
]


def create_course_docx(course_data: dict):
    file_path = os.path.join(CLO_DIR, course_data["filename"])
    doc = docx.Document()

    # Title
    p_title = doc.add_paragraph()
    p_title.add_run("CHƯƠNG TRÌNH MÔN HỌC").bold = True

    # Name & Code
    p_name = doc.add_paragraph()
    p_name.add_run(f"Tên môn học: {course_data['subject_name']}").bold = True
    doc.add_paragraph(f"Mã môn học: {course_data['subject_code']}")
    doc.add_paragraph(f"Thời gian thực hiện môn học: {course_data['hours']}")

    # Section I
    doc.add_paragraph()
    p_sec1 = doc.add_paragraph()
    p_sec1.add_run("I. VỊ TRÍ, TÍNH CHẤT CỦA MÔN HỌC:").bold = True
    doc.add_paragraph("- Vị trí: Môn học được bố trí sau khi sinh viên học xong các môn học chung, các mô đun cơ sở chuyên ngành đào tạo chuyên môn nghề.")
    doc.add_paragraph("- Tính chất: Là môn học chuyên ngành thuộc Khoa Công Nghệ Thông Tin trong hệ thống CSDL Supabase.")

    # Section II - CLO Objectives
    doc.add_paragraph()
    p_sec2 = doc.add_paragraph()
    p_sec2.add_run("II. MỤC TIÊU MÔN HỌC:").bold = True
    doc.add_paragraph("Sau khi học xong chương trình môn học người học có năng lực:")

    # Knowledge
    doc.add_paragraph("- Về kiến thức:")
    for k in course_data["knowledge"]:
        doc.add_paragraph(f"+ {k}")

    # Skills
    doc.add_paragraph("- Về kỹ năng:")
    for s in course_data["skills"]:
        doc.add_paragraph(f"+ {s}")

    # Autonomy
    doc.add_paragraph("- Về năng lực tự chủ và trách nhiệm:")
    for a in course_data["autonomy"]:
        doc.add_paragraph(f"+ {a}")

    # Section III - Table breakdown
    doc.add_paragraph()
    p_sec3 = doc.add_paragraph()
    p_sec3.add_run("III. NỘI DUNG MÔN HỌC:").bold = True
    doc.add_paragraph("1. Nội dung tổng quát và phân phối thời gian:")

    table = doc.add_table(rows=1, cols=6)
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Số TT"
    hdr_cells[1].text = "Tên chương, mục"
    hdr_cells[2].text = "Tổng số (giờ)"
    hdr_cells[3].text = "Lý thuyết"
    hdr_cells[4].text = "Thực hành"
    hdr_cells[5].text = "Kiểm tra"

    for idx, (ch_name, ch_hours) in enumerate(course_data["chapters"], start=1):
        row_cells = table.add_row().cells
        row_cells[0].text = str(idx)
        row_cells[1].text = ch_name
        row_cells[2].text = str(ch_hours)
        row_cells[3].text = str(int(ch_hours * 0.5))
        row_cells[4].text = str(int(ch_hours * 0.5))
        row_cells[5].text = "0"

    doc.save(file_path)
    print(f"Created docx for pre-existing Supabase subject: {file_path}")


def main():
    # Remove old files in CLO directory except original ChuongTrinh_AnToanBaoMatThongTin.docx
    for item in os.listdir(CLO_DIR):
        if item != "ChuongTrinh_AnToanBaoMatThongTin.docx" and item.endswith(".docx"):
            os.remove(os.path.join(CLO_DIR, item))

    print(f"Generating CLO docx files for {len(SUPABASE_CNTT_COURSES)} pre-existing Supabase subjects into {CLO_DIR}...")
    for course in SUPABASE_CNTT_COURSES:
        create_course_docx(course)
    print("Generation complete!")

if __name__ == "__main__":
    main()
