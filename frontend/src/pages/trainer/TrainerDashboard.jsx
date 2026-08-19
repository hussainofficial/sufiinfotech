import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function TrainerDashboard() {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    client.get('/courses/batches/mine').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">My Batches</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900">{b.name}</p>
            <p className="text-sm text-slate-500 mt-1">{b.course_title}</p>
            <p className="text-xs text-slate-400 mt-2">{b.timing || 'Timing not set'}</p>
            <p className="text-xs text-slate-400">{b.seats_filled}/{b.seats_total} students</p>
          </div>
        ))}
        {batches.length === 0 && <p className="text-sm text-slate-400">No batches assigned to you yet</p>}
      </div>
    </div>
  );
}
