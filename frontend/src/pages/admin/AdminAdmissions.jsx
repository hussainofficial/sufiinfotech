import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminAdmissions() {
  const [enquiries, setEnquiries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    enquiry_id: '', name: '', email: '', phone: '', dob: '', address: '', batch_id: '', installments: 1, password: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function load() {
    client.get('/enquiries').then((res) => setEnquiries(res.data.filter((e) => e.status !== 'converted'))).catch(() => {});
    client.get('/courses/batches/all').then((res) => setBatches(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  function pickEnquiry(e) {
    const enquiry = enquiries.find((en) => en.id === Number(e.target.value));
    if (!enquiry) {
      setForm((f) => ({ ...f, enquiry_id: '' }));
      return;
    }
    setForm((f) => ({ ...f, enquiry_id: enquiry.id, name: enquiry.name, email: enquiry.email || '', phone: enquiry.phone }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const res = await client.post('/admissions', form);
      setResult(res.data);
      setForm({ enquiry_id: '', name: '', email: '', phone: '', dob: '', address: '', batch_id: '', installments: 1, password: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create admission');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">New Admission</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 max-w-lg">
        <select value={form.enquiry_id} onChange={pickEnquiry} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Walk-in (no enquiry) — fill manually below</option>
          {enquiries.map((en) => (
            <option key={en.id} value={en.id}>{en.name} — {en.phone}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <input required placeholder="Phone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input type="date" placeholder="Date of birth" value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <input type="number" min="1" max="12" placeholder="Fee installments" value={form.installments}
            onChange={(e) => setForm({ ...form, installments: e.target.value })}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <textarea placeholder="Address" value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" rows={2} />
        <select required value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Select batch to enroll in</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name} ({b.course_title}) — {b.seats_filled}/{b.seats_total} seats</option>
          ))}
        </select>
        <div>
          <input type="text" placeholder="Set student login password (optional)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
          <p className="text-xs text-slate-400 mt-1">Leave blank to auto-generate a random password (emailed to the student either way).</p>
        </div>

        <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">
          Create Admission
        </button>
      </form>

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm max-w-lg">
          <p className="text-green-700">Admission created. Login credentials emailed to the student.</p>
          <p className="text-slate-600 mt-1">Password (backup): <b>{result.tempPassword}</b></p>
        </div>
      )}
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <h2 className="font-semibold text-slate-900 mt-10 mb-3">Enquiries Awaiting Admission</h2>
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 max-w-lg">
        {enquiries.map((en) => (
          <div key={en.id} className="px-4 py-3 flex justify-between text-sm">
            <span>{en.name} &middot; {en.phone}</span>
            <span className="text-slate-400">{en.course_title || 'No course preference'}</span>
          </div>
        ))}
        {enquiries.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No pending enquiries</p>}
      </div>
    </div>
  );
}
