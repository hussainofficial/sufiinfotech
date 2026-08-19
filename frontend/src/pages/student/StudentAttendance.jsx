import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    client.get('/attendance/mine').then((res) => setRecords(res.data)).catch(() => {});
  }, []);

  const present = records.filter((r) => r.status === 'present').length;
  const percentage = records.length ? Math.round((present / records.length) * 100) : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">My Attendance</h1>
      {records.length > 0 && (
        <p className="text-sm text-slate-600 mb-4">
          Overall attendance: <b>{percentage}%</b> ({present}/{records.length} days)
        </p>
      )}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {records.map((r, i) => (
          <div key={i} className="px-4 py-3 flex justify-between text-sm">
            <span>{r.date?.slice(0, 10)}</span>
            <span className={
              r.status === 'present' ? 'text-green-600' : r.status === 'leave' ? 'text-amber-600' : 'text-red-600'
            }>
              {r.status}
            </span>
          </div>
        ))}
        {records.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No attendance records yet</p>}
      </div>
    </div>
  );
}
