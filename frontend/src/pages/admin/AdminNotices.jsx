import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });

  function load() {
    client.get('/notices').then((res) => setNotices(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await client.post('/notices', form);
    setForm({ title: '', content: '' });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Notices</h1>

      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md mb-6">
        <input required placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <textarea required placeholder="Content" value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" rows={3} />
        <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Post Notice</button>
      </form>

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
