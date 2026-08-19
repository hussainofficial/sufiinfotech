import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', password: '' });
  const [result, setResult] = useState(null);

  function load() {
    client.get('/trainers').then((res) => setTrainers(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setResult(null);
    const res = await client.post('/trainers', form);
    setResult(res.data);
    setForm({ name: '', email: '', phone: '', specialization: '', password: '' });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Trainers</h1>

      <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md mb-4">
        <input required placeholder="Full name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <input placeholder="Specialization (e.g. Web Development)" value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <div>
          <input type="text" placeholder="Set trainer login password (optional)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <p className="text-xs text-slate-400 mt-1">Leave blank to auto-generate a random password (emailed to the trainer either way).</p>
        </div>
        <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Add Trainer</button>
      </form>

      {result && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-sm max-w-md">
          <p className="text-green-700">Trainer account created. Credentials emailed.</p>
          <p className="text-slate-600 mt-1">Password (backup): <b>{result.tempPassword}</b></p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {trainers.map((t) => (
          <div key={t.id} className="px-4 py-3 flex justify-between text-sm">
            <div>
              <p className="text-slate-900">{t.name}</p>
              <p className="text-xs text-slate-500">{t.email} {t.specialization ? `· ${t.specialization}` : ''}</p>
            </div>
            <span className="text-slate-400">{t.phone}</span>
          </div>
        ))}
        {trainers.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No trainers added yet</p>}
      </div>
    </div>
  );
}
