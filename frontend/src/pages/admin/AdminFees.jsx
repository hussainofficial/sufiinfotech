import { Fragment, useEffect, useState } from 'react';
import client from '../../api/client';

const statusColor = {
  paid: 'text-green-600 bg-green-50',
  pending: 'text-amber-600 bg-amber-50',
  overdue: 'text-red-600 bg-red-50',
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [filter, setFilter] = useState('');
  const [openId, setOpenId] = useState(null);
  const [payForm, setPayForm] = useState({ amount_paid: '', payment_date: todayStr(), next_due_date: '' });

  function load() {
    client.get('/fees', { params: filter ? { status: filter } : {} }).then((res) => setFees(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, [filter]);

  function openPayment(f) {
    const balance = Number(f.amount) - Number(f.paid_amount || 0);
    setOpenId(f.id);
    setPayForm({ amount_paid: balance.toFixed(2), payment_date: todayStr(), next_due_date: '' });
  }

  async function submitPayment(id) {
    await client.patch(`/fees/${id}/pay`, {
      payment_method: 'cash',
      amount_paid: payForm.amount_paid,
      payment_date: payForm.payment_date,
      next_due_date: payForm.next_due_date || undefined,
    });
    setOpenId(null);
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
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => {
              const balance = Number(f.amount) - Number(f.paid_amount || 0);
              return (
                <Fragment key={f.id}>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-900">{f.student_name}</td>
                    <td className="px-4 py-3">{f.course_title}</td>
                    <td className="px-4 py-3">₹{f.amount}</td>
                    <td className="px-4 py-3">₹{Number(f.paid_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">₹{balance.toFixed(2)}</td>
                    <td className="px-4 py-3">{f.due_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${statusColor[f.status]}`}>{f.status}</span>
                      {f.status !== 'paid' && Number(f.paid_amount) > 0 && (
                        <span className="ml-1 text-xs text-slate-400">(partially paid)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.status !== 'paid' && (
                        <button onClick={() => (openId === f.id ? setOpenId(null) : openPayment(f))} className="text-xs text-slate-900 underline">
                          {openId === f.id ? 'Close' : 'Record Payment'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {openId === f.id && (
                    <tr className="bg-slate-50 border-t border-slate-100">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Amount paid now</label>
                            <input type="number" step="0.01" value={payForm.amount_paid}
                              onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })}
                              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm w-32" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Payment date</label>
                            <input type="date" value={payForm.payment_date}
                              onChange={(e) => setPayForm({ ...payForm, payment_date: e.target.value })}
                              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Next due date (if balance remains)</label>
                            <input type="date" value={payForm.next_due_date}
                              onChange={(e) => setPayForm({ ...payForm, next_due_date: e.target.value })}
                              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
                          </div>
                          <button onClick={() => submitPayment(f.id)} className="bg-slate-900 text-white rounded-md px-4 py-1.5 text-sm hover:bg-slate-800">
                            Save Payment
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Balance due: ₹{balance.toFixed(2)}. If the amount paid is less than the balance, this installment stays
                          pending/overdue for the remainder — set a next due date to control when it's flagged overdue again.
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {fees.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">No fee records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
