import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { DevicesPage } from './pages/admin/DevicesPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { AdminTeachersPage } from './pages/admin/TeachersPage';
import { AdminStudentsPage } from './pages/admin/StudentsPage';

// Faculty/Dean Pages
import { DeanDashboard } from './pages/faculty/DeanDashboard';
import { TeachersPage } from './pages/faculty/TeachersPage';
import { AttendanceStatsPage } from './pages/faculty/AttendanceStatsPage';

// Department Head Pages
import { DeptHeadDashboard } from './pages/department/DeptHeadDashboard';
import { TeachingProgressPage } from './pages/department/TeachingProgressPage';
import { QuestionsPage } from './pages/department/QuestionsPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherSchedulePage } from './pages/teacher/TeacherSchedulePage';
import { TeacherExamsPage } from './pages/teacher/TeacherExamsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentSchedule } from './pages/student/StudentSchedule';
import { CVBuilder } from './pages/student/CVBuilder';
import { StudentScores } from './pages/student/StudentScores';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';

const RootRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 99:
      return <Navigate to="/admin" replace />;
    case 50:
      return <Navigate to="/faculty" replace />;
    case 20:
      return <Navigate to="/department" replace />;
    case 10:
    case 2:
      return <Navigate to="/teacher" replace />;
    case 1:
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes (Role 99) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[99]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute allowedRoles={[99]}>
                <DashboardLayout>
                  <AuditLogsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/devices"
            element={
              <ProtectedRoute allowedRoles={[99]}>
                <DashboardLayout>
                  <DevicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={[99]}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={[99]}><DashboardLayout><AdminTeachersPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={[99]}><DashboardLayout><AdminStudentsPage /></DashboardLayout></ProtectedRoute>} />

          {/* Faculty Dean Routes (Role 50) */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={[50]}>
                <DashboardLayout>
                  <DeanDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/teachers"
            element={
              <ProtectedRoute allowedRoles={[50]}>
                <DashboardLayout>
                  <TeachersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedRoute allowedRoles={[50]}>
                <DashboardLayout>
                  <AttendanceStatsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Department Head Routes (Role 20) */}
          <Route
            path="/department"
            element={
              <ProtectedRoute allowedRoles={[20]}>
                <DashboardLayout>
                  <DeptHeadDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/progress"
            element={
              <ProtectedRoute allowedRoles={[20]}>
                <DashboardLayout>
                  <TeachingProgressPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/questions"
            element={
              <ProtectedRoute allowedRoles={[20]}>
                <DashboardLayout>
                  <QuestionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes (Role 10, 2) */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={[10, 2]}>
                <DashboardLayout>
                  <TeacherDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/schedule"
            element={
              <ProtectedRoute allowedRoles={[10, 2]}>
                <DashboardLayout>
                  <TeacherSchedulePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/exams"
            element={
              <ProtectedRoute allowedRoles={[10, 2]}>
                <DashboardLayout>
                  <TeacherExamsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes (Role 1) */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/announcements"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardLayout>
                  <StudentAnnouncements />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/scores"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardLayout>
                  <StudentScores />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/schedule"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardLayout>
                  <StudentSchedule />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/cv"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardLayout>
                  <CVBuilder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
