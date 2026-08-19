import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function StudentNotices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    client.get('/notices').then((res) => setNotices(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Notices</h1>
      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900">{n.title}</p>
            <p className="text-sm text-slate-600 mt-1">{n.content}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {notices.length === 0 && <p className="text-sm text-slate-400">No notices yet</p>}
      </div>
    </div>
  );
}
