import React from 'react';
import { mockQuestionSuites } from '../../mock/mockData';
import { Database } from '@phosphor-icons/react';

export const QuestionsPage: React.FC = () => {
  return (
    <div className="panel-card fade-in">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={24} color="#22C55E" />
          <h2>Ngân hàng câu hỏi & Đề thi bộ môn</h2>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã Môn</th>
              <th>Tên Môn Học</th>
              <th>Số Câu Dễ</th>
              <th>Số Câu Trung Bình</th>
              <th>Số Câu Khó</th>
              <th>Tổng Số Câu Hỏi</th>
              <th>Cập nhật gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {mockQuestionSuites.map((qs) => {
              const total = qs.easyCount + qs.normalCount + qs.hardCount;
              return (
                <tr key={qs.id}>
                  <td style={{ fontFamily: 'var(--font-heading)', color: '#22C55E', fontWeight: 600 }}>{qs.subjectCode}</td>
                  <td style={{ fontWeight: 600 }}>{qs.subjectName}</td>
                  <td style={{ color: '#22C55E' }}>{qs.easyCount}</td>
                  <td style={{ color: '#EAB308' }}>{qs.normalCount}</td>
                  <td style={{ color: '#EF4444' }}>{qs.hardCount}</td>
                  <td style={{ fontWeight: 700, color: '#3B82F6', fontFamily: 'var(--font-heading)' }}>{total}</td>
                  <td>{qs.lastUpdated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
