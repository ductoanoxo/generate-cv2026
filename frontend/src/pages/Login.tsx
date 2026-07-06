import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, SignIn } from '@phosphor-icons/react';
import { mockUsers } from '../mock/mockData';

export const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    const success = await login(username);
    if (success) {
      // Find what role this user is and redirect accordingly
      const user = mockUsers.find(u => u.username === username.trim().toLowerCase());
      if (user) {
        switch (user.role) {
          case 99:
            navigate('/admin');
            break;
          case 50:
            navigate('/faculty');
            break;
          case 20:
            navigate('/department');
            break;
          case 10:
          case 2:
            navigate('/teacher');
            break;
          case 1:
            navigate('/student');
            break;
          default:
            navigate('/');
        }
      }
    } else {
      setError('Tên đăng nhập không đúng hoặc không tồn tại.');
    }
  };

  const handleSelectMockUser = (userStr: string) => {
    setUsername(userStr);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', padding: '16px', borderRadius: '50%' }}>
              <GraduationCap size={48} weight="fill" />
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>TÂY ĐÔ COLLEGE</h1>
          <p style={{ fontSize: '0.85rem' }}>Hệ thống quản lý đào tạo & Dashboard trực quan</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Nhập tên đăng nhập (ví dụ: admin, sv_toan)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu (Chỉ xem - Không yêu cầu)</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="••••••••"
              disabled
              value="********"
            />
          </div>

          {error && (
            <div style={{ color: 'var(--color-destructive)', fontSize: '0.85rem', fontWeight: 600, borderLeft: '3px solid var(--color-destructive)', paddingLeft: '8px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-submit">
            <SignIn size={20} weight="bold" />
            <span>Đăng nhập</span>
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài khoản dùng thử nhanh:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mockUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectMockUser(user.username)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 150ms ease',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#22C55E' }}>{user.username}</span>
                  <span style={{ color: '#94A3B8', marginLeft: '8px' }}>({user.fullName})</span>
                </div>
                <span className="user-badge" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  Role {user.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
