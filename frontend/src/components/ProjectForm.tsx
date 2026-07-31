import React, { useState } from 'react';
import {
  FileText, 
  Plus, 
  Trash, 
  GithubLogo, 
  Spinner, 
  Sparkle,
  Link as LinkIcon 
} from '@phosphor-icons/react';
import { scrapeGithub } from '../services/aiService';

export interface Project {
  name: string;
  role: string;
  description: string;
  technologies: string[];
}

interface ProjectFormProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onRemoveProject: (index: number) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  projects,
  onAddProject,
  onRemoveProject
}) => {
  const [newProject, setNewProject] = useState({
    name: '',
    role: '',
    description: '',
    technologies: ''
  });
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeStatusMessage, setScrapeStatusMessage] = useState<string | null>(null);

  const handleManualAdd = () => {
    if (newProject.name.trim() && newProject.role.trim()) {
      const techArray = newProject.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      onAddProject({
        name: newProject.name.trim(),
        role: newProject.role.trim(),
        description: newProject.description.trim(),
        technologies: techArray
      });

      setNewProject({ name: '', role: '', description: '', technologies: '' });
    }
  };

  const handleScrapeGithub = async () => {
    if (!githubUrl.trim()) {
      setScrapeStatusMessage('Vui lòng nhập đường dẫn GitHub Repository (vd: https://github.com/user/repo)');
      setTimeout(() => setScrapeStatusMessage(null), 3000);
      return;
    }

    setIsScraping(true);
    setScrapeStatusMessage('Đang kết nối GitHub & phân tích dữ liệu dự án...');

    try {
      const response = await scrapeGithub({ github_url: githubUrl.trim() });
      const technologies = Object.values(response.tech_stack || {}).flat().filter(Boolean);
      const project = {
        name: response.repo.name || response.repo.full_name || 'Dự án từ GitHub',
        role: 'Full-stack Developer',
        description: response.project_summary || response.repo.description || `Dự án GitHub: ${response.repo.full_name}`,
        technologies: Array.from(new Set(technologies)),
      };
      setNewProject({ ...project, technologies: project.technologies.join(', ') });
      onAddProject(project);
      setScrapeStatusMessage('✅ Đã đọc GitHub thật và thêm dự án vào CV!');
    } catch (err) {
      console.warn('GitHub scrape failed', err);
      setScrapeStatusMessage('Không thể đọc repository GitHub. Kiểm tra URL hoặc thử lại.');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FileText size={18} />
        <span>5. Dự án thực tế</span>
      </h3>

      {/* GitHub Auto-Scrape Tool Block */}
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        border: '1px solid rgba(51, 65, 85, 0.7)', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GithubLogo size={16} color="#F8FAFC" />
          <span>Tự động trích xuất thông tin từ GitHub Repository</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Nhập đường dẫn GitHub (vd: https://github.com/facebook/react)"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
            <LinkIcon size={16} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <button 
            type="button"
            className="btn-icon-text primary" 
            onClick={handleScrapeGithub}
            disabled={isScraping}
            style={{ padding: '0 16px', whiteSpace: 'nowrap', opacity: isScraping ? 0.7 : 1 }}
          >
            {isScraping ? (
              <>
                <Spinner size={18} className="spin" />
                <span>Đang trích xuất...</span>
              </>
            ) : (
              <>
                <Sparkle size={18} />
                <span>Auto Scrape</span>
              </>
            )}
          </button>
        </div>

        {scrapeStatusMessage && (
          <div style={{ 
            fontSize: '0.78rem', 
            color: scrapeStatusMessage.includes('✅') || scrapeStatusMessage.includes('✨') ? '#22C55E' : '#EAB308',
            fontStyle: 'italic',
            marginTop: '2px'
          }}>
            {scrapeStatusMessage}
          </div>
        )}
      </div>

      {/* Manual Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Tên dự án *" 
            className="input-field" 
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
          />
          <input 
            type="text" 
            placeholder="Vai trò *" 
            className="input-field" 
            value={newProject.role}
            onChange={(e) => setNewProject(prev => ({ ...prev, role: e.target.value }))}
          />
        </div>
        <input 
          type="text" 
          placeholder="Công nghệ sử dụng (ngăn cách bằng dấu phẩy, vd: React, Node.js)" 
          className="input-field" 
          value={newProject.technologies}
          onChange={(e) => setNewProject(prev => ({ ...prev, technologies: e.target.value }))}
        />
        <textarea 
          placeholder="Mô tả chi tiết dự án & kết quả đạt được..." 
          className="input-field" 
          rows={2} 
          style={{ resize: 'vertical' }}
          value={newProject.description}
          onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
        />
        <button 
          className="btn-icon-text primary" 
          onClick={handleManualAdd} 
          style={{ justifyContent: 'center' }}
        >
          <Plus size={16} />
          <span>Thêm dự án vào CV</span>
        </button>
      </div>

      {/* Project Item Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {projects.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Chưa có dự án nào được thêm.</div>
        ) : (
          projects.map((proj, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '10px 12px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>
                  {proj.name} <span style={{ color: '#22C55E', fontWeight: 500, fontSize: '0.8rem' }}>({proj.role})</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px', lineHeight: '1.4' }}>{proj.description}</div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {proj.technologies.map((tech, tIdx) => (
                      <span key={tIdx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(51, 65, 85, 0.6)', color: '#CBD5E1', borderRadius: '4px' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onRemoveProject(idx)}
                style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}
                title="Xóa dự án"
              >
                <Trash size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
