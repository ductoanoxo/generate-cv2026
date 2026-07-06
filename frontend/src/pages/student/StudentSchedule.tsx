import React from 'react';
import { mockSchedules } from '../../mock/mockData';
import { Calendar } from '@phosphor-icons/react';

export const StudentSchedule: React.FC = () => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getSlotDetails = (dayIdx: number, slotNum: number) => {
    const dayOfWeek = dayIdx + 2;
    return mockSchedules.find(
      (sch) => sch.dayOfWeek === dayOfWeek && slotNum >= sch.slotStart && slotNum <= sch.slotEnd
    );
  };

  return (
    <div className="panel-card fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#22C55E" />
          <h2>Thời khóa biểu học tập của tôi</h2>
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
