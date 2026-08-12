import React, { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { 
  UploadSimple, 
  FileText, 
  Trash, 
  Sparkle, 
  ClipboardText, 
  Check,
  FilePdf,
  FileDoc
} from '@phosphor-icons/react';
import { parseJobDescription } from '../services/aiService';

interface JDInputFormProps {
  onAnalyze: (jdText: string, fileName?: string, file?: File) => void;
  isLoading?: boolean;
  initialText?: string;
}

const SAMPLE_JDS = [
  {
    title: 'Frontend React Developer',
    text: `Vị trí: Lập trình viên Frontend React (Junior/Middle)
Yêu cầu công việc:
- Thành thạo HTML5, CSS3, JavaScript (ES6+) và TypeScript.
- Có kinh nghiệm thực chiến phát triển ứng dụng Web SPA với React.js, React Hooks, Redux/Zustand.
- Hiểu biết về Kỹ thuật lập trình, Cấu trúc dữ liệu & Giải thuật.
- Sử dụng thành thạo Git, RESTful API integration và thiết kế giao diện Responsive CSS.
- Có tư duy Phân tích và Thiết kế hệ thống UI/UX, tối ưu hiệu năng trang web.`
  },
  {
    title: 'Backend C# .NET Developer',
    text: `Vị trí: Lập trình viên Backend .NET Core
Yêu cầu công việc:
- Sử dụng thành thạo ngôn ngữ C# và nền tảng .NET Core / ASP.NET Web API.
- Kiến thức vững chắc về Cơ sở dữ liệu relational (PostgreSQL, SQL Server), thiết kế database schema và tối ưu truy vấn SQL.
- Hiểu về Kỹ thuật phần mềm, Phân tích và thiết kế hệ thống, Thiết kế kiến trúc phần mềm.
- Am hiểu về REST API, JWT Authentication và Microservices.
- Kỹ năng làm việc nhóm, kiểm thử phần mềm (Unit Test/Integration Test).`
  },
  {
    title: 'Chuyên Viên Cơ Sở Dữ Liệu & Hệ Thống',
    text: `Vị trí: Data & System Administrator
Yêu cầu công việc:
- Quản trị và thiết kế Cơ sở dữ liệu SQL Server, PostgreSQL, MySQL.
- Thành thạo Phân tích và thiết kế hệ thống thông tin, vẽ sơ đồ ERD, DFD.
- Lập trình C/C++ hoặc C# xử lý dữ liệu và thuật toán tối ưu.
- Quản trị mạng máy tính, An toàn và bảo mật thông tin.
- Có khả năng đọc hiểu tài liệu tiếng Anh chuyên ngành.`
  }
];

export const JDInputForm: React.FC<JDInputFormProps> = ({
  onAnalyze,
  isLoading = false,
  initialText = ''
}) => {
  const [jdText, setJdText] = useState<string>(initialText);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileParseError, setFileParseError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedSample, setCopiedSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File reading helper logic
  const handleFile = async (file: File) => {
    if (!file) return;

    setSelectedFile(file);
    setFileParseError('');
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || ''
    });

    const reader = new FileReader();

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) setJdText(text);
      };
      reader.readAsText(file);
    } else {
      // Parse binary files through the AI service immediately so the extracted
      // content is shown in the textarea instead of exposing ZIP bytes ("PK").
      setIsParsingFile(true);
      try {
        const parsed = await parseJobDescription('', file);
        setJdText(parsed.markdown || '');
        if (!parsed.markdown?.trim()) {
          setFileParseError('Không trích xuất được nội dung từ file. Vui lòng thử file khác hoặc dán JD thủ công.');
        }
      } catch {
        setFileParseError('Không thể đọc nội dung file. Vui lòng thử lại hoặc dán JD thủ công.');
      } finally {
        setIsParsingFile(false);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sampleText: string, sampleTitle: string) => {
    setJdText(sampleText);
    setUploadedFile(null);
    setSelectedFile(null);
    setFileParseError('');
    setCopiedSample(sampleTitle);
    setTimeout(() => setCopiedSample(null), 2000);
  };

  const handleClear = () => {
    setJdText('');
    setUploadedFile(null);
    setSelectedFile(null);
    setFileParseError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!jdText.trim() && !selectedFile) || isParsingFile) return;
    // Use the text currently visible/edited in the textarea. Only retry with
    // the original file when parsing did not produce any text.
    onAnalyze(jdText, uploadedFile?.name, jdText.trim() ? undefined : selectedFile || undefined);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <FilePdf size={28} color="#EF4444" weight="fill" />;
    }
    if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      return <FileDoc size={28} color="#3B82F6" weight="fill" />;
    }
    return <FileText size={28} color="#22C55E" weight="fill" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="panel-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Form Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#F8FAFC' }}>
            <FileText size={24} color="#22C55E" weight="bold" />
            <span>Bước 1: Nhập Mô Tả Công Việc (Job Description - JD)</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>
            Kéo thả tệp PDF/DOCX hoặc dán nội dung JD để hệ thống AI tự động khớp môn học & điểm số thực tế từ cơ sở dữ liệu.
          </p>
        </div>
        {(jdText || fileParseError) && (
          <button 
            type="button"
            className="btn-icon-text"
            onClick={handleClear}
            style={{ fontSize: '0.85rem', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
          >
            <Trash size={16} />
            <span>Xóa nội dung</span>
          </button>
        )}
      </div>

      {/* Quick Sample JD Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkle size={16} color="#EAB308" weight="fill" />
          <span>Mẫu JD gợi ý nhanh:</span>
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SAMPLE_JDS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.text, sample.title)}
              style={{
                background: copiedSample === sample.title ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                border: copiedSample === sample.title ? '1px solid #22C55E' : '1px solid var(--color-border)',
                color: copiedSample === sample.title ? '#22C55E' : '#E2E8F0',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedSample === sample.title ? <Check size={14} /> : <ClipboardText size={14} />}
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? '2px dashed #22C55E' : '2px dashed var(--color-border)',
            background: isDragging ? 'rgba(34, 197, 94, 0.05)' : 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2 ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {uploadedFile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(30, 41, 59, 0.8)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              {getFileIcon(uploadedFile.name)}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>{uploadedFile.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{formatFileSize(uploadedFile.size)}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                  setSelectedFile(null);
                  setFileParseError('');
                }}
                style={{ background: 'none', border: 'none', color: '#EF4444', marginLeft: '12px', cursor: 'pointer' }}
                title="Đổi tệp khác"
              >
                <Trash size={18} />
              </button>
            </div>
          ) : (
            <>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadSimple size={26} color="#22C55E" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E2E8F0' }}>
                  Kéo thả file JD vào đây hoặc <span style={{ color: '#22C55E', textDecoration: 'underline' }}>chọn file từ máy tính</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                  Hỗ trợ các định dạng: PDF, DOCX, DOC, TXT (Tối đa 10MB)
                </div>
              </div>
            </>
          )}
        </div>

        {/* Text area input */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
              Nội dung mô tả công việc (JD Text):
            </label>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              {jdText.length} ký tự
            </span>
          </div>
          <textarea
            className="input-field"
            rows={7}
            placeholder="Dán nội dung tuyển dụng JD vào đây (ví dụ: Yêu cầu kỹ năng React, C#, SQL, Kỹ thuật lập trình...)..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              background: '#0F172A',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: '#F1F5F9',
              padding: '12px'
            }}
          />
          {isParsingFile && (
            <div role="status" style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '6px' }}>
              Đang đọc nội dung từ {uploadedFile?.name}...
            </div>
          )}
          {fileParseError && (
            <div role="alert" style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '6px' }}>
              {fileParseError}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={(!jdText.trim() && !selectedFile) || isLoading || isParsingFile}
            className="btn-icon-text primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: (!jdText.trim() && !selectedFile) || isLoading || isParsingFile ? 'not-allowed' : 'pointer',
              opacity: (!jdText.trim() && !selectedFile) || isLoading || isParsingFile ? 0.6 : 1,
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
            }}
          >
            {isLoading ? (
              <>
                <div 
                  className="spinner" 
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid #FFFFFF', 
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} 
                />
                <span>Đang truy vấn điểm số & Khớp môn học...</span>
              </>
            ) : (
              <>
                <Sparkle size={20} weight="fill" />
                <span>Phân Tích JD & Khớp Môn Học Thực Tế</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
