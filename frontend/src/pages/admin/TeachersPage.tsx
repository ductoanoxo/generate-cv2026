import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users } from '@phosphor-icons/react';

type Teacher = { id:string; name:string; username:string; email:string; faculty:string; isHeadOfFaculty:boolean; avatarUrl?:string };
export const AdminTeachersPage: React.FC = () => {
  const [rows,setRows]=useState<Teacher[]>([]); const [q,setQ]=useState('');
  useEffect(()=>{ axios.get<Teacher[]>('http://localhost:5000/api/admin/teachers',{params:{search:q||undefined}}).then(r=>setRows(r.data)).catch(()=>setRows([])); },[q]);
  return <div className="panel-card fade-in"><div className="panel-header"><h2><Users size={22}/> Danh sách giảng viên ({rows.length})</h2><input placeholder="Tìm giảng viên..." value={q} onChange={e=>setQ(e.target.value)} /></div><div className="data-table-container"><table className="data-table"><thead><tr><th>Giảng viên</th><th>Email</th><th>Khoa</th><th>Vai trò</th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td><img src={t.avatarUrl||`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}`} alt="avatar" style={{width:30,height:30,borderRadius:'50%',verticalAlign:'middle',marginRight:8}}/>{t.name}</td><td>{t.email}</td><td>{t.faculty}</td><td>{t.isHeadOfFaculty?'Trưởng khoa':'Giảng viên'}</td></tr>)}</tbody></table></div></div>;
};
