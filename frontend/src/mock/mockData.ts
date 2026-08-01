export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: number; // 1: Student, 2: Visiting Teacher, 10: Teacher, 20: Dept Head, 50: Dean, 99: Admin
  avatar?: string;
  facultyId?: string;
  majorId?: string;
}

export interface Student {
  id: string;
  userId: string;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  birthDate: string;
  cccd: string;
  hometown: string;
  fatherName: string;
  motherName: string;
  faculty: string;
  major: string;
  academicYear: string;
  avatar?: string;
  gpa: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  ipAddress: string;
  creationDate: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  lastActive: string;
}

export interface SubjectTeaching {
  id: string;
  subjectCode: string;
  subjectName: string;
  classCode: string;
  teacherName: string;
  totalSessions: number;
  completedSessions: number;
  studentsCount: number;
}

export interface SubjectSchedule {
  id: string;
  subjectName: string;
  classCode: string;
  room: string;
  dayOfWeek: number; // 2 to 8 (2 = Monday, 8 = Sunday)
  slotStart: number; // 1 to 12
  slotEnd: number;
  teacherName: string;
}

export interface Attendance {
  id: string;
  studentName: string;
  subjectName: string;
  date: string;
  status: number; // 1 = Present, 2 = Late, 3 = Excused Absence, 4 = Unexcused Absence
}

export interface ExamResult {
  id: string;
  studentName: string;
  subjectName: string;
  score: number;
  examDate: string;
}

export interface QuestionSuite {
  id: string;
  subjectCode: string;
  subjectName: string;
  easyCount: number;
  normalCount: number;
  hardCount: number;
  lastUpdated: string;
}

// Global Mock Users
export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', fullName: 'Nguyễn Văn Quản Trị', email: 'admin@taydo.edu.vn', role: 99 },
  { id: 'u2', username: 'deankhoa', fullName: 'TS. Trần Minh Khoa', email: 'tmkhoa@taydo.edu.vn', role: 50, facultyId: 'f1' },
  { id: 'u3', username: 'tbm_cntt', fullName: 'ThS. Nguyễn Thị Trưởng', email: 'nttruong@taydo.edu.vn', role: 20, facultyId: 'f1' },
  { id: 'u4', username: 'gv_nam', fullName: 'ThS. Lê Hoàng Nam', email: 'lhnam@taydo.edu.vn', role: 10, facultyId: 'f1' },
  { id: 'u5', username: 'gv_lien', fullName: 'Cô Nguyễn Bích Liên', email: 'nblien@taydo.edu.vn', role: 2, facultyId: 'f1' },
  { id: 'u6', username: 'sv_toan', fullName: 'Đặng Đức Toàn', email: 'toan.dd26@taydo.edu.vn', role: 1, facultyId: 'f1', majorId: 'm1' },
  { id: 'u7', username: 'sv_vy', fullName: 'Trần Thị Thảo Vy', email: 'vy.ttt26@taydo.edu.vn', role: 1, facultyId: 'f1', majorId: 'm1' }
];

// Student Detailed Profiles
export const mockStudents: Student[] = [
  {
    id: 's1',
    userId: 'u6',
    studentCode: 'SV26001',
    fullName: 'Đặng Đức Toàn',
    email: 'toan.dd26@taydo.edu.vn',
    phoneNumber: '0987654321',
    gender: 'Nam',
    birthDate: '2005-04-12',
    cccd: '079205001234',
    hometown: 'Cần Thơ',
    fatherName: 'Đặng Văn Hùng',
    motherName: 'Lê Thị Mai',
    faculty: 'Khoa Công nghệ Thông tin',
    major: 'Kỹ thuật Phần mềm',
    academicYear: 'K21 (2024-2027)',
    gpa: 8.4
  },
  {
    id: 's2',
    userId: 'u7',
    studentCode: 'SV26002',
    fullName: 'Trần Thị Thảo Vy',
    email: 'vy.ttt26@taydo.edu.vn',
    phoneNumber: '0912345678',
    gender: 'Nữ',
    birthDate: '2005-09-18',
    cccd: '079205005678',
    hometown: 'Vĩnh Long',
    fatherName: 'Trần Văn Bình',
    motherName: 'Nguyễn Thị Hoa',
    faculty: 'Khoa Công nghệ Thông tin',
    major: 'Kỹ thuật Phần mềm',
    academicYear: 'K21 (2024-2027)',
    gpa: 7.9
  }
];

// Audit logs
export const mockAuditLogs: AuditLog[] = [
  { id: 'a1', userId: 'u1', username: 'admin', action: 'Login thành công', ipAddress: '113.161.42.10', creationDate: '2026-07-06T20:45:00Z' },
  { id: 'a2', userId: 'u6', username: 'sv_toan', action: 'Xem bảng điểm thi', ipAddress: '27.72.103.54', creationDate: '2026-07-06T20:30:00Z' },
  { id: 'a3', userId: 'u4', username: 'gv_nam', action: 'Điểm danh môn Kỹ thuật Lập trình', ipAddress: '14.232.88.22', creationDate: '2026-07-06T18:15:00Z' },
  { id: 'a4', userId: 'u1', username: 'admin', action: 'Đồng bộ cấu hình học kỳ', ipAddress: '113.161.42.10', creationDate: '2026-07-06T16:00:00Z' },
  { id: 'a5', userId: 'u2', username: 'deankhoa', action: 'Xem báo cáo điểm danh khoa', ipAddress: '115.79.201.12', creationDate: '2026-07-06T15:20:00Z' }
];

// Devices
export const mockDevices: UserDevice[] = [
  { id: 'd1', userId: 'u1', deviceName: 'MacBook Pro M3 (Chrome)', deviceType: 'Desktop', lastActive: '2026-07-06T20:45:00Z' },
  { id: 'd2', userId: 'u6', deviceName: 'iPhone 15 Pro Max (Safari)', deviceType: 'Mobile', lastActive: '2026-07-06T20:30:00Z' },
  { id: 'd3', userId: 'u4', deviceName: 'Dell XPS 15 (Windows Edge)', deviceType: 'Desktop', lastActive: '2026-07-06T19:00:00Z' },
  { id: 'd4', userId: 'u7', deviceName: 'iPad Air 5 (Safari)', deviceType: 'Tablet', lastActive: '2026-07-06T17:15:00Z' },
  { id: 'd5', userId: 'u2', deviceName: 'ThinkPad X1 (Ubuntu Chrome)', deviceType: 'Desktop', lastActive: '2026-07-06T15:20:00Z' }
];

// Settings
export const mockSettings = {
  academicYear: '2025-2026',
  semester: 'Học kỳ II',
  registrationDeadline: '2026-08-30',
  minimumCreditsToGraduate: '120 credits',
  allowEvaluationEdit: 'false',
  systemMaintenanceMode: 'false',
  backupFrequency: 'Hàng ngày (03:00)',
  apiRateLimit: '60 requests/min',
  moodleIntegration: 'Enabled',
  smsGateway: 'Enabled (Viettel)',
  emailNotification: 'True'
};

// Subject teachings (Lớp học phần)
export const mockSubjectTeachings: SubjectTeaching[] = [
  { id: 'st1', subjectCode: 'IT101', subjectName: 'Kỹ thuật lập trình C', classCode: 'IT21A', teacherName: 'ThS. Lê Hoàng Nam', totalSessions: 15, completedSessions: 12, studentsCount: 45 },
  { id: 'st2', subjectCode: 'IT102', subjectName: 'Cơ sở dữ liệu', classCode: 'IT21B', teacherName: 'Cô Nguyễn Bích Liên', totalSessions: 15, completedSessions: 14, studentsCount: 40 },
  { id: 'st3', subjectCode: 'IT201', subjectName: 'Lập trình Web nâng cao', classCode: 'IT21A', teacherName: 'ThS. Lê Hoàng Nam', totalSessions: 15, completedSessions: 9, studentsCount: 45 },
  { id: 'st4', subjectCode: 'IT203', subjectName: 'Phân tích và thiết kế hệ thống', classCode: 'IT21C', teacherName: 'ThS. Nguyễn Thị Trưởng', totalSessions: 15, completedSessions: 15, studentsCount: 38 },
  { id: 'st5', subjectCode: 'IT301', subjectName: 'Kỹ thuật phần mềm', classCode: 'IT20A', teacherName: 'ThS. Nguyễn Thị Trưởng', totalSessions: 15, completedSessions: 5, studentsCount: 52 }
];

// Schedules
export const mockSchedules: SubjectSchedule[] = [
  // Monday
  { id: 'sch1', subjectName: 'Kỹ thuật lập trình C', classCode: 'IT21A', room: 'A201', dayOfWeek: 2, slotStart: 1, slotEnd: 4, teacherName: 'ThS. Lê Hoàng Nam' },
  { id: 'sch2', subjectName: 'Cơ sở dữ liệu', classCode: 'IT21B', room: 'A202', dayOfWeek: 2, slotStart: 5, slotEnd: 8, teacherName: 'Cô Nguyễn Bích Liên' },
  // Tuesday
  { id: 'sch3', subjectName: 'Lập trình Web nâng cao', classCode: 'IT21A', room: 'B104', dayOfWeek: 3, slotStart: 1, slotEnd: 4, teacherName: 'ThS. Lê Hoàng Nam' },
  { id: 'sch4', subjectName: 'Kỹ thuật phần mềm', classCode: 'IT20A', room: 'C203', dayOfWeek: 3, slotStart: 5, slotEnd: 8, teacherName: 'ThS. Nguyễn Thị Trưởng' },
  // Wednesday
  { id: 'sch5', subjectName: 'Phân tích và thiết kế hệ thống', classCode: 'IT21C', room: 'A205', dayOfWeek: 4, slotStart: 1, slotEnd: 4, teacherName: 'ThS. Nguyễn Thị Trưởng' },
  { id: 'sch6', subjectName: 'Kỹ thuật lập trình C', classCode: 'IT21A', room: 'A201', dayOfWeek: 4, slotStart: 5, slotEnd: 8, teacherName: 'ThS. Lê Hoàng Nam' },
  // Thursday
  { id: 'sch7', subjectName: 'Cơ sở dữ liệu', classCode: 'IT21B', room: 'A202', dayOfWeek: 5, slotStart: 1, slotEnd: 4, teacherName: 'Cô Nguyễn Bích Liên' },
  { id: 'sch8', subjectName: 'Lập trình Web nâng cao', classCode: 'IT21A', room: 'B104', dayOfWeek: 5, slotStart: 5, slotEnd: 8, teacherName: 'ThS. Lê Hoàng Nam' },
  // Friday
  { id: 'sch9', subjectName: 'Kỹ thuật phần mềm', classCode: 'IT20A', room: 'C203', dayOfWeek: 6, slotStart: 1, slotEnd: 4, teacherName: 'ThS. Nguyễn Thị Trưởng' }
];

// Attendance logs
export const mockAttendanceLogs: Attendance[] = [
  { id: 'at1', studentName: 'Đặng Đức Toàn', subjectName: 'Kỹ thuật lập trình C', date: '2026-07-06', status: 1 },
  { id: 'at2', studentName: 'Đặng Đức Toàn', subjectName: 'Lập trình Web nâng cao', date: '2026-07-06', status: 2 },
  { id: 'at3', studentName: 'Trần Thị Thảo Vy', subjectName: 'Kỹ thuật lập trình C', date: '2026-07-06', status: 1 },
  { id: 'at4', studentName: 'Trần Thị Thảo Vy', subjectName: 'Lập trình Web nâng cao', date: '2026-07-06', status: 1 },
  
  { id: 'at5', studentName: 'Đặng Đức Toàn', subjectName: 'Kỹ thuật lập trình C', date: '2026-07-02', status: 1 },
  { id: 'at6', studentName: 'Đặng Đức Toàn', subjectName: 'Lập trình Web nâng cao', date: '2026-07-02', status: 1 },
  { id: 'at7', studentName: 'Trần Thị Thảo Vy', subjectName: 'Kỹ thuật lập trình C', date: '2026-07-02', status: 3 }, // Excused Absence
  { id: 'at8', studentName: 'Trần Thị Thảo Vy', subjectName: 'Lập trình Web nâng cao', date: '2026-07-02', status: 4 }, // Unexcused Absence
  
  { id: 'at9', studentName: 'Đặng Đức Toàn', subjectName: 'Kỹ thuật lập trình C', date: '2026-06-29', status: 1 },
  { id: 'at10', studentName: 'Đặng Đức Toàn', subjectName: 'Lập trình Web nâng cao', date: '2026-06-29', status: 4 },
  { id: 'at11', studentName: 'Trần Thị Thảo Vy', subjectName: 'Kỹ thuật lập trình C', date: '2026-06-29', status: 1 },
  { id: 'at12', studentName: 'Trần Thị Thảo Vy', subjectName: 'Lập trình Web nâng cao', date: '2026-06-29', status: 1 }
];

// Exam results
export const mockExamResults: ExamResult[] = [
  { id: 'er1', studentName: 'Đặng Đức Toàn', subjectName: 'Kỹ thuật lập trình C', score: 8.5, examDate: '2026-06-20' },
  { id: 'er2', studentName: 'Đặng Đức Toàn', subjectName: 'Lập trình Web nâng cao', score: 9.0, examDate: '2026-06-22' },
  { id: 'er3', studentName: 'Đặng Đức Toàn', subjectName: 'Cơ sở dữ liệu', score: 7.8, examDate: '2026-06-25' },
  { id: 'er4', studentName: 'Đặng Đức Toàn', subjectName: 'Phân tích và thiết kế hệ thống', score: 8.2, examDate: '2026-06-28' },
  
  { id: 'er5', studentName: 'Trần Thị Thảo Vy', subjectName: 'Kỹ thuật lập trình C', score: 9.2, examDate: '2026-06-20' },
  { id: 'er6', studentName: 'Trần Thị Thảo Vy', subjectName: 'Lập trình Web nâng cao', score: 7.5, examDate: '2026-06-22' },
  { id: 'er7', studentName: 'Trần Thị Thảo Vy', subjectName: 'Cơ sở dữ liệu', score: 8.0, examDate: '2026-06-25' },
  { id: 'er8', studentName: 'Trần Thị Thảo Vy', subjectName: 'Phân tích và thiết kế hệ thống', score: 6.8, examDate: '2026-06-28' }
];

// Question suites
export const mockQuestionSuites: QuestionSuite[] = [
  { id: 'qs1', subjectCode: 'IT101', subjectName: 'Kỹ thuật lập trình C', easyCount: 120, normalCount: 95, hardCount: 45, lastUpdated: '2026-06-15' },
  { id: 'qs2', subjectCode: 'IT102', subjectName: 'Cơ sở dữ liệu', easyCount: 150, normalCount: 110, hardCount: 60, lastUpdated: '2026-06-18' },
  { id: 'qs3', subjectCode: 'IT201', subjectName: 'Lập trình Web nâng cao', easyCount: 90, normalCount: 80, hardCount: 30, lastUpdated: '2026-06-22' },
  { id: 'qs4', subjectCode: 'IT203', subjectName: 'Phân tích và thiết kế hệ thống', easyCount: 100, normalCount: 75, hardCount: 40, lastUpdated: '2026-06-24' }
];

// System overall statistics (Admin views)
export const adminStats = {
  kpis: {
    students: 577,
    teachers: 67,
    faculties: 9,
    subjects: 390,
    majors: 24
  },
  studentsByFaculty: [
    { name: 'Công nghệ Thông tin', count: 180 },
    { name: 'Kinh tế & Quản trị', count: 140 },
    { name: 'Kỹ thuật - Công nghệ', count: 95 },
    { name: 'Nông nghiệp & Sinh học', count: 62 },
    { name: 'Ngoại ngữ', count: 100 }
  ],
  studentsByFacultyAndMajor: [
    { faculty: 'Công nghệ Thông tin', major: 'Kỹ thuật Phần mềm', count: 80 },
    { faculty: 'Công nghệ Thông tin', major: 'Khoa học Máy tính', count: 60 },
    { faculty: 'Công nghệ Thông tin', major: 'An toàn Thông tin', count: 40 },
    { faculty: 'Kinh tế & Quản trị', major: 'Quản trị Kinh doanh', count: 70 },
    { faculty: 'Kinh tế & Quản trị', major: 'Tài chính Ngân hàng', count: 50 },
    { faculty: 'Kinh tế & Quản trị', major: 'Kế toán', count: 20 },
    { faculty: 'Kỹ thuật - Công nghệ', major: 'Công nghệ Kỹ thuật Ô tô', count: 55 },
    { faculty: 'Kỹ thuật - Công nghệ', major: 'Kỹ thuật Điện', count: 40 },
    { faculty: 'Nông nghiệp & Sinh học', major: 'Nông nghiệp Công nghệ cao', count: 35 },
    { faculty: 'Nông nghiệp & Sinh học', major: 'Công nghệ Thực phẩm', count: 27 },
    { faculty: 'Ngoại ngữ', major: 'Ngôn ngữ Anh', count: 60 },
    { faculty: 'Ngoại ngữ', major: 'Ngôn ngữ Trung', count: 40 }
  ],
  studentsByYear: [
    { year: 'K19 (2022-2025)', count: 175 },
    { year: 'K20 (2023-2026)', count: 198 },
    { year: 'K21 (2024-2027)', count: 204 }
  ],
  studentsByYearAndGender: [
    { year: 'K19 (2022-2025)', gender: 'Nam', count: 95 },
    { year: 'K19 (2022-2025)', gender: 'Nữ', count: 80 },
    { year: 'K20 (2023-2026)', gender: 'Nam', count: 108 },
    { year: 'K20 (2023-2026)', gender: 'Nữ', count: 90 },
    { year: 'K21 (2024-2027)', gender: 'Nam', count: 114 },
    { year: 'K21 (2024-2027)', gender: 'Nữ', count: 90 }
  ],
  attendanceTrend: [
    { month: 'T10/2025', present: 94, late: 2, excused: 1, unexcused: 3 },
    { month: 'T11/2025', present: 93, late: 3, excused: 1, unexcused: 3 },
    { month: 'T12/2025', present: 92, late: 3, excused: 2, unexcused: 3 },
    { month: 'T01/2026', present: 95, late: 2, excused: 1, unexcused: 2 },
    { month: 'T02/2026', present: 91, late: 4, excused: 2, unexcused: 3 },
    { month: 'T03/2026', present: 93, late: 3, excused: 1, unexcused: 3 },
    { month: 'T04/2026', present: 94, late: 2, excused: 1, unexcused: 3 },
    { month: 'T05/2026', present: 92, late: 3, excused: 2, unexcused: 3 }
  ],
  attendanceDistribution: [
    { name: 'Có mặt', value: 59807, color: '#22C55E' },
    { name: 'Đi trễ', value: 3381, color: '#EAB308' },
    { name: 'Vắng có phép', value: 3171, color: '#3B82F6' },
    { name: 'Vắng không phép', value: 27506, color: '#EF4444' }
  ],
  scoreDistribution: [
    { name: 'Kém (<4)', value: 1200 },
    { name: 'Yếu (4-5)', value: 3400 },
    { name: 'TB (5-6.5)', value: 12500 },
    { name: 'Khá (6.5-8)', value: 9800 },
    { name: 'Giỏi (8+)', value: 4179 }
  ],
  examResultsByFaculty: [
    { faculty: 'Công nghệ Thông tin', kem: 5, yeu: 10, tb: 35, kha: 38, gioi: 12, avg: 7.2 },
    { faculty: 'Kinh tế & Quản trị', kem: 4, yeu: 12, tb: 42, kha: 32, gioi: 10, avg: 6.9 },
    { faculty: 'Kỹ thuật - Công nghệ', kem: 8, yeu: 15, tb: 38, kha: 30, gioi: 9, avg: 6.7 },
    { faculty: 'Nông nghiệp & Sinh học', kem: 3, yeu: 8, tb: 45, kha: 34, gioi: 10, avg: 7.0 },
    { faculty: 'Ngoại ngữ', kem: 2, yeu: 6, tb: 30, kha: 45, gioi: 17, avg: 7.5 }
  ],
  devicesDistribution: [
    { name: 'Desktop', value: 450, color: '#64748B' },
    { name: 'Mobile', value: 180, color: '#22C55E' },
    { name: 'Tablet', value: 35, color: '#3B82F6' }
  ]
};

// Dean statistics (Faculty view)
export const facultyStats = {
  kpis: {
    students: 180,
    teachers: 15,
    majors: 3,
    subjects: 45
  },
  teachers: [
    { name: 'TS. Trần Minh Khoa', title: 'Trưởng Khoa / GV', isHead: true, email: 'tmkhoa@taydo.edu.vn' },
    { name: 'ThS. Nguyễn Thị Trưởng', title: 'Trưởng Bộ môn / GV', isHead: false, email: 'nttruong@taydo.edu.vn' },
    { name: 'ThS. Lê Hoàng Nam', title: 'Giảng viên', isHead: false, email: 'lhnam@taydo.edu.vn' },
    { name: 'ThS. Phạm Thanh Sơn', title: 'Giảng viên', isHead: false, email: 'ptson@taydo.edu.vn' },
    { name: 'Cô Nguyễn Bích Liên', title: 'Giảng viên thỉnh giảng', isHead: false, email: 'nblien@taydo.edu.vn' }
  ],
  classAttendanceRates: [
    { name: 'IT21A - Lập trình C', present: 95, late: 2, absence: 3 },
    { name: 'IT21B - Cơ sở dữ liệu', present: 91, late: 3, absence: 6 },
    { name: 'IT21A - Web nâng cao', present: 93, late: 1, absence: 6 },
    { name: 'IT20A - Kỹ thuật PM', present: 88, late: 5, absence: 7 }
  ],
  averageScoresBySubject: [
    { name: 'Kỹ thuật lập trình C', score: 7.2 },
    { name: 'Cơ sở dữ liệu', score: 6.8 },
    { name: 'Lập trình Web nâng cao', score: 7.5 },
    { name: 'Phân tích & thiết kế HT', score: 7.0 },
    { name: 'Kỹ thuật phần mềm', score: 7.4 }
  ],
  teacherEvaluations: [
    { aspect: 'Kiến thức chuyên môn', value: 4.8 },
    { aspect: 'Phương pháp sư phạm', value: 4.5 },
    { aspect: 'Tương tác & hỗ trợ', value: 4.6 },
    { aspect: 'Đúng giờ & kỷ luật', value: 4.9 },
    { aspect: 'Tính rõ ràng của bài giảng', value: 4.4 }
  ],
  semesterProgress: 80 // 80% completed
};

// Department Head statistics
export const departmentStats = {
  kpis: {
    students: 120,
    classes: 4,
    subjects: 18
  },
  teachingProgress: [
    { subject: 'Kỹ thuật lập trình C (IT21A)', done: 12, total: 15 },
    { subject: 'Lập trình Web nâng cao (IT21A)', done: 9, total: 15 },
    { subject: 'Kỹ thuật phần mềm (IT20A)', done: 5, total: 15 },
    { subject: 'Phân tích và thiết kế HT (IT21C)', done: 15, total: 15 }
  ],
  classScoresComparison: [
    { subject: 'Kỹ thuật lập trình C', IT21A: 7.5, IT21B: 6.8, IT21C: 7.0 },
    { subject: 'Cơ sở dữ liệu', IT21A: 6.9, IT21B: 7.2, IT21C: 6.5 },
    { subject: 'Lập trình Web nâng cao', IT21A: 8.0, IT21B: 7.1, IT21C: 7.4 }
  ]
};

// Teacher Dashboard data
export const teacherStats = {
  alertStudents: [
    { name: 'Trần Văn An', classCode: 'IT21A', reason: 'Vắng 4 buổi không phép', status: 'Warning' },
    { name: 'Lê Thị Bình', classCode: 'IT21A', reason: 'GPA < 5.0 (Cần chú ý)', status: 'Notice' },
    { name: 'Phạm Minh Đức', classCode: 'IT21B', reason: 'Vắng 3 buổi liên tiếp', status: 'Warning' }
  ]
};

// Student Dashboard notifications & CV templates
export const studentStats = {
  announcements: [
    { id: 'an1', title: 'Thông báo đóng học phí học kỳ II', date: '2026-07-05', content: 'Yêu cầu tất cả sinh viên đóng học phí học kỳ II trước ngày 20/07/2026.', sender: 'Phòng Tài vụ' },
    { id: 'an2', title: 'Lịch thi kết thúc học phần đợt 1', date: '2026-07-02', content: 'Lịch thi kết thúc học phần đợt 1 bắt đầu từ ngày 15/07/2026. Sinh viên xem phòng thi chi tiết tại dashboard.', sender: 'Phòng Đào tạo' },
    { id: 'an3', title: 'Đăng ký đề tài Nghiên cứu khoa học SV', date: '2026-06-28', content: 'Mở cổng đăng ký đề tài Nghiên cứu khoa học dành cho sinh viên đến hết ngày 10/07/2026.', sender: 'Khoa CNTT' }
  ]
};

// CV Generation System
export interface Certification {
  certificationName: string;
  date: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface CategorizedSkillGroup {
  category: string;
  items: string[];
}

export interface CVData {
  profile: Student;
  summary: string;
  skills: string[];
  categorizedSkills?: CategorizedSkillGroup[];
  languages: string[];
  projects: { name: string; description: string; role: string; technologies: string[] }[];
  certifications: Certification[];
  experience: Experience[];
  grades: { subjectName: string; score: number; credits: number }[];
  activities: string[];
}

export const defaultCVData: CVData = {
  profile: {
    id: '', userId: '', studentCode: '', fullName: '', email: '', phoneNumber: '',
    gender: '', birthDate: '', cccd: '', hometown: '', fatherName: '', motherName: '',
    faculty: '', major: '', academicYear: '', gpa: 0
  },
  summary: '',
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  experience: [],
  activities: [],
  grades: []
};
