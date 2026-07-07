import React, { useState, useEffect } from 'react';
import { mockSchedules } from '../../mock/mockData';
import { Calendar, Database, Cloud } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

interface SubjectSchedule {
  id: string;
  subjectName: string;
  classCode: string;
  room: string;
  dayOfWeek: number; // 2 to 8 (2 = Monday, 8 = Sunday)
  slotStart: number; // 1 to 12
  slotEnd: number;
  teacherName: string;
}

export const TeacherSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<SubjectSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const teacherId = user?.id ?? 'u4';
        const response = await axios.get<SubjectSchedule[]>(`http://localhost:5000/api/schedule/teacher/${teacherId}`);
        setSchedules(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Backend schedule API failed, falling back to local mock', err);
        setIsMock(true);
        // Fallback to local mock data matching backend response format
        setSchedules(mockSchedules.slice(0, 4).map(sch => ({
          id: sch.id,
          subjectName: sch.subjectName,
          classCode: sch.classCode,
          room: sch.room,
          dayOfWeek: sch.dayOfWeek,
          slotStart: sch.slotStart,
          slotEnd: sch.slotEnd,
          teacherName: sch.teacherName
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getSlotDetails = (dayIdx: number, slotNum: number) => {
    // dayOfWeek maps 2 to Monday, 3 to Tuesday etc.
    const dayOfWeek = dayIdx + 2;
    return schedules.find(
      (sch) => sch.dayOfWeek === dayOfWeek && slotNum >= sch.slotStart && slotNum <= sch.slotEnd
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#22C55E', fontWeight: 600 }}>
        <div className="spinner" style={{ border: '3px solid rgba(34, 197, 94, 0.1)', borderTop: '3px solid #22C55E', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <span>Đang tải lịch giảng dạy...</span>
      </div>
    );
  }

  return (
    <div className="panel-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* API Connection Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 16px' }}>
        <div style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Trạng thái kết nối:</span>
          {isMock ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#EAB308', fontWeight: 600 }}>
              <Database size={16} /> Dữ liệu Giả lập (Mock Fallback)
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#22C55E', fontWeight: 600 }}>
              <Cloud size={16} /> Đã kết nối Backend API (.NET 8)
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
          Tổng số lịch học: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{schedules.length} tiết</span>
        </div>
      </div>

      <div className="panel-header" style={{ border: 'none', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#22C55E" />
          <h2>Lịch giảng dạy chi tiết trong tuần</h2>
        </div>
      </div>

      <div className="schedule-grid" style={{ marginTop: '16px' }}>
        <div className="schedule-header-cell">Tiết học</div>
        {days.map((day, idx) => (
          <div key={idx} className="schedule-header-cell">{day}</div>
        ))}

        {slots.map((slot) => (
          <React.Fragment key={slot}>
            <div className="schedule-time-cell">Tiết {slot}</div>
            {days.map((_, dayIdx) => {
              const schedule = getSlotDetails(dayIdx, slot);
              if (schedule) {
                // Only render cell content on slotStart to avoid duplicating cells in vertical spans
                if (schedule.slotStart === slot) {
                  const span = schedule.slotEnd - schedule.slotStart + 1;
                  return (
                    <div
                      key={dayIdx}
                      className="schedule-slot-cell"
                      style={{ gridRow: `span ${span}`, height: 'auto' }}
                    >
                      <div className="schedule-slot-occupied">
                        <div className="schedule-slot-title">{schedule.subjectName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#94A3B8' }}>
                          <span>Lớp: {schedule.classCode}</span>
                          <span className="schedule-slot-room">{schedule.room}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null; // Empty placeholder space covered by gridRow span
              } else {
                return <div key={dayIdx} className="schedule-slot-cell" />;
              }
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
