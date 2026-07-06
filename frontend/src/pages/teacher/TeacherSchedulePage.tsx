import React from 'react';
import { mockSchedules } from '../../mock/mockData';
import { Calendar } from '@phosphor-icons/react';

export const TeacherSchedulePage: React.FC = () => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getSlotDetails = (dayIdx: number, slotNum: number) => {
    // dayOfWeek maps 2 to Monday, 3 to Tuesday etc.
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
