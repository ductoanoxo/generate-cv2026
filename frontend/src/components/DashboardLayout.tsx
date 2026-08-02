import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  User as UserIcon,
  Notebook,
  Megaphone,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_KEY = 'sidebar_collapsed';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin, isDean, isDeptHead, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch { /* noop */ }
  }, [collapsed]);

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
    <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <GraduationCap size={32} weight="bold" />
          {!collapsed && (
            <div>
              <h2>Tây Đô</h2>
              <p style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 'bold' }}>COLLEGE PORTAL</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(prev => !prev)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
        </button>

        <nav className="sidebar-menu">
          {/* Base path dynamically routes to specific dashboard */}
          <NavLink to={getDashboardPath()} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Dashboard' : undefined}>
            <House size={20} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Admin Menu */}
          {isAdmin && (
            <>
              <NavLink to="/admin/logs" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Audit Logs' : undefined}>
                <Clock size={20} />
                {!collapsed && <span>Audit Logs</span>}
              </NavLink>
              <NavLink to="/admin/devices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Thiết Bị' : undefined}>
                <DeviceMobile size={20} />
                {!collapsed && <span>Thiết Bị</span>}
              </NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Cấu Hình' : undefined}>
                <Gear size={20} />
                {!collapsed && <span>Cấu Hình</span>}
              </NavLink>
              <NavLink to="/admin/teachers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Giảng viên' : undefined}>
                <Users size={20} />
                {!collapsed && <span>Giảng viên</span>}
              </NavLink>
              <NavLink to="/admin/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Sinh viên' : undefined}>
                <GraduationCap size={20} />
                {!collapsed && <span>Sinh viên</span>}
              </NavLink>
            </>
          )}

          {/* Dean Menu */}
          {isDean && (
            <>
              <NavLink to="/faculty/teachers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Giáo Viên' : undefined}>
                <Users size={20} />
                {!collapsed && <span>Giáo Viên</span>}
              </NavLink>
              <NavLink to="/faculty/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Thống Kê Điểm Danh' : undefined}>
                <ClipboardText size={20} />
                {!collapsed && <span>Thống Kê Điểm Danh</span>}
              </NavLink>
            </>
          )}

          {/* Department Head Menu */}
          {isDeptHead && (
            <>
              <NavLink to="/department/progress" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Tiến Độ Dạy' : undefined}>
                <Calendar size={20} />
                {!collapsed && <span>Tiến Độ Dạy</span>}
              </NavLink>
              <NavLink to="/department/questions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Ngân Hàng Đề' : undefined}>
                <Database size={20} />
                {!collapsed && <span>Ngân Hàng Đề</span>}
              </NavLink>
            </>
          )}

          {/* Teacher Menu */}
          {isTeacher && (
            <>
              <NavLink to="/teacher/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Lịch Dạy' : undefined}>
                <Calendar size={20} />
                {!collapsed && <span>Lịch Dạy</span>}
              </NavLink>
              <NavLink to="/teacher/exams" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Ngân Hàng Đề' : undefined}>
                <ClipboardText size={20} />
                {!collapsed && <span>Ngân Hàng Đề</span>}
              </NavLink>
            </>
          )}

          {/* Mẫu 07 verification menu (Teacher / Dept Head / Dean) */}
          {(isTeacher || isDeptHead || isDean) && (
            <NavLink to="/teacher/internship-verifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Xác Thực Thực Tập Mẫu 07' : undefined}>
              <ShieldCheck size={20} />
              {!collapsed && <span>Xác Thực Thực Tập (Mẫu 07)</span>}
            </NavLink>
          )}

          {/* Student Menu */}
          {isStudent && (
            <>
              <NavLink to="/student/announcements" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Thông Báo' : undefined}>
                <Megaphone size={20} />
                {!collapsed && <span>Thông Báo</span>}
              </NavLink>
              <NavLink to="/student/scores" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Xem Điểm' : undefined}>
                <Notebook size={20} />
                {!collapsed && <span>Xem Điểm</span>}
              </NavLink>
              <NavLink to="/student/schedule" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Thời Khóa Biểu' : undefined}>
                <Calendar size={20} />
                {!collapsed && <span>Thời Khóa Biểu</span>}
              </NavLink>
              <NavLink to="/student/cv" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title={collapsed ? 'Tạo CV Cá Nhân' : undefined}>
                <FileText size={20} />
                {!collapsed && <span>Tạo CV Cá Nhân</span>}
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }} title={collapsed ? 'Đăng xuất' : undefined}>
            <SignOut size={20} />
            {!collapsed && <span>Đăng xuất</span>}
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
