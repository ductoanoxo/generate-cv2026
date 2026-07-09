import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, SignIn } from '@phosphor-icons/react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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

    const success = await login(username, password);
    if (success) {
      const storedUserStr = localStorage.getItem('taydo_user');
      if (storedUserStr) {
        const user = JSON.parse(storedUserStr);
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
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  const handleSelectDemoUser = (userStr: string, passStr: string) => {
    setUsername(userStr);
    setPassword(passStr);
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-foreground)',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 150ms ease',
    textAlign: 'left',
    width: '100%'
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = '#22C55E';
    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.borderColor = 'var(--color-border)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
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
              placeholder="Nhập tên đăng nhập (ví dụ: admin1, sinhvien1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Nhập mật khẩu (ví dụ: password123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài khoản chạy thật (Database Supabase - MK: password123):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('admin1', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>admin1</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Admin)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('deankhoa', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>deankhoa</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Dean - Khoa)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('tbm_cntt', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>tbm_cntt</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(TBM - Bộ môn)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('sv_toan', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>sv_toan</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Student)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('giaovien1', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>giaovien1</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Dean DB)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('giaovien2', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>giaovien2</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Teacher DB)</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('sinhvien1', 'password123')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>sinhvien1</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Student DB)</span>
              </div>
            </button>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tài khoản mẫu (Local database seeder):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('admin', 'admin')}
              style={buttonStyle}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <div>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>admin</span>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', marginLeft: '4px' }}>(Admin)</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
