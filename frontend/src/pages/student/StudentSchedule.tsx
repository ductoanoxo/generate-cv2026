import React, { useState, useEffect } from 'react';
import { mockSchedules } from '../../mock/mockData';
import { Calendar, Cloud, Database } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMock, setIsMock] = useState<boolean>(false);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const studentId = user?.id || 'd3b07384-d113-49be-a5d2-000000000000';
        const response = await axios.get<any[]>(`http://localhost:5000/api/schedule/student/${studentId}`);
        setSchedules(response.data);
        setIsMock(false);
      } catch (err: any) {
        console.warn('Failed to fetch student schedule from API, using mock data', err);
        setSchedules(mockSchedules);
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#94A3B8' }}>Đang tải lịch học...</p>
      </div>
    );
  }

  const getSlotDetails = (dayIdx: number, slotNum: number) => {
    const dayOfWeek = dayIdx + 2;
    return schedules.find(
      (sch) => sch.dayOfWeek === dayOfWeek && slotNum >= sch.slotStart && slotNum <= sch.slotEnd
    );
  };

  return (
    <div className="panel-card fade-in">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#22C55E" />
          <h2>Thời khóa biểu học tập của tôi</h2>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: isMock ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: isMock ? '#EAB308' : '#22C55E',
          fontSize: '0.7rem',
          fontWeight: 600
        }}>
          {isMock ? <Cloud size={14} /> : <Database size={14} />}
          <span>{isMock ? 'CSDL Offline' : 'Live DB'}</span>
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
                if (schedule.slotStart === slot) {
                  const span = schedule.slotEnd - schedule.slotStart + 1;
                  return (
                    <div
                      key={dayIdx}
                      className="schedule-slot-cell"
                      style={{ gridRow: `span ${span}`, height: 'auto' }}
                    >
                      <div className="schedule-slot-occupied" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', borderLeft: '3px solid #3B82F6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div className="schedule-slot-title">{schedule.subjectName}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#94A3B8' }}>
                          <span className="schedule-slot-room" style={{ color: '#3B82F6' }}>{schedule.room}</span>
                          <span style={{ fontSize: '0.65rem' }}>GV: {schedule.teacherName.split(' ').pop()}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
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
