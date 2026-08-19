import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminAttendance() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get('/courses/batches/all').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!batchId) { setStudents([]); return; }
    client.get(`/students/batch/${batchId}`).then((res) => {
      setStudents(res.data);
      setStatuses(Object.fromEntries(res.data.map((s) => [s.id, 'present'])));
    }).catch(() => {});
  }, [batchId]);

  async function handleSave() {
    setSaved(false);
    const records = students.map((s) => ({ student_id: s.id, status: statuses[s.id] }));
    await client.post('/attendance', { batch_id: batchId, date, records });
    setSaved(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Attendance</h1>

      <div className="flex gap-3 mb-6">
        <select value={batchId} onChange={(e) => setBatchId(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Select batch</option>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.course_title})</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
      </div>

      {students.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {students.map((s) => (
            <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-slate-900">{s.name}</span>
              <div className="flex gap-2">
                {['present', 'absent', 'leave'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setStatuses({ ...statuses, [s.id]: opt })}
                    className={`px-3 py-1 rounded-md text-xs border capitalize ${
                      statuses[s.id] === opt ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <button onClick={handleSave} className="mt-4 bg-slate-900 text-white rounded-md px-4 py-2 text-sm hover:bg-slate-800">
          Save Attendance
        </button>
      )}
      {saved && <p className="text-green-600 text-sm mt-2">Attendance saved.</p>}
    </div>
  );
}
