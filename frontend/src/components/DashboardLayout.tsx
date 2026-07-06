import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  House, 
  Calendar, 
  GraduationCap, 
  ClipboardText, 
  FileText, 
  Users, 
  Gear, 
  DeviceMobile, 
  Database, 
  Clock, 
  SignOut,
  User as UserIcon
} from '@phosphor-icons/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin, isDean, isDeptHead, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 99: return 'Admin';
      case 50: return 'Trưởng Khoa';
      case 20: return 'Trưởng Bộ Môn';
      case 10: return 'Giáo Viên';
      case 2: return 'GV Thỉnh Giảng';
      case 1: return 'Sinh Viên';
      default: return 'User';
    }
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isDean) return '/faculty';
    if (isDeptHead) return '/department';
    if (isTeacher) return '/teacher';
    if (isStudent) return '/student';
    return '/login';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <GraduationCap size={32} weight="bold" />
          <div>
            <h2>Tây Đô</h2>
            <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 'bold' }}>COLLEGE PORTAL</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {/* Base path dynamically routes to specific dashboard */}
          <NavLink to={getDashboardPath()} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <House size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* Admin Menu */}
          {isAdmin && (
            <>
              <NavLink to="/admin/logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Clock size={20} />
                <span>Audit Logs</span>
              </NavLink>
              <NavLink to="/admin/devices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <DeviceMobile size={20} />
                <span>Thiết Bị</span>
              </NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Gear size={20} />
                <span>Cấu Hình</span>
              </NavLink>
            </>
          )}

          {/* Dean Menu */}
          {isDean && (
            <>
              <NavLink to="/faculty/teachers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Giáo Viên</span>
              </NavLink>
              <NavLink to="/faculty/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ClipboardText size={20} />
                <span>Thống Kê Điểm Danh</span>
              </NavLink>
            </>
          )}

          {/* Department Head Menu */}
          {isDeptHead && (
            <>
              <NavLink to="/department/progress" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={20} />
                <span>Tiến Độ Dạy</span>
              </NavLink>
              <NavLink to="/department/questions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Database size={20} />
                <span>Ngân Hàng Đề</span>
              </NavLink>
            </>
          )}

          {/* Teacher Menu */}
          {isTeacher && (
            <>
              <NavLink to="/teacher/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={20} />
                <span>Lịch Dạy</span>
              </NavLink>
              <NavLink to="/teacher/exams" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ClipboardText size={20} />
                <span>Ngân Hàng Đề</span>
              </NavLink>
            </>
          )}

          {/* Student Menu */}
          {isStudent && (
            <>
              <NavLink to="/student/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={20} />
                <span>Thời Khóa Biểu</span>
              </NavLink>
              <NavLink to="/student/cv" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} />
                <span>Tạo CV Cá Nhân</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
            <SignOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>Cổng thông tin Tây Đô ({getRoleName()})</h1>
          </div>

          <div className="header-user">
            <span className="user-badge">{getRoleName()}</span>
            <div className="header-user">
              <div className="avatar">
                {user?.fullName ? user.fullName.split(' ').pop()?.[0] : <UserIcon />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
