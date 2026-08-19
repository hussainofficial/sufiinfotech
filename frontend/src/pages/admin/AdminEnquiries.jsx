import { useEffect, useState } from 'react';
import client from '../../api/client';

const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'closed'];

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);

  function load() {
    client.get('/enquiries').then((res) => setEnquiries(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await client.patch(`/enquiries/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Enquiries</h1>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{e.name}</td>
                <td className="px-4 py-3">{e.phone}</td>
                <td className="px-4 py-3">{e.course_title || '-'}</td>
                <td className="px-4 py-3">
                  <select
                    value={e.status}
                    onChange={(ev) => updateStatus(e.id, ev.target.value)}
                    className="border border-slate-300 rounded-md px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(e.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No enquiries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
