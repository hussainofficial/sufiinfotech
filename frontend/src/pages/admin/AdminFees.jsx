import { useEffect, useState } from 'react';
import client from '../../api/client';

const statusColor = {
  paid: 'text-green-600 bg-green-50',
  pending: 'text-amber-600 bg-amber-50',
  overdue: 'text-red-600 bg-red-50',
};

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [filter, setFilter] = useState('');

  function load() {
    client.get('/fees', { params: filter ? { status: filter } : {} }).then((res) => setFees(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, [filter]);

  async function markPaid(id) {
    await client.patch(`/fees/${id}/pay`, { payment_method: 'cash' });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Fees</h1>

      <div className="mb-4 flex gap-2">
        {['', 'pending', 'overdue', 'paid'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm border ${filter === s ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{f.student_name}</td>
                <td className="px-4 py-3">{f.course_title}</td>
                <td className="px-4 py-3">₹{f.amount}</td>
                <td className="px-4 py-3">{f.due_date?.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusColor[f.status]}`}>{f.status}</span>
                </td>
                <td className="px-4 py-3">
                  {f.status !== 'paid' && (
                    <button onClick={() => markPaid(f.id)} className="text-xs text-slate-900 underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No fee records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
