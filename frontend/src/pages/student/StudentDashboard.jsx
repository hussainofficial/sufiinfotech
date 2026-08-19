import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const [fees, setFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const { user } = useAuth();

  function loadFees() {
    client.get('/fees/mine').then((res) => setFees(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadFees();
    client.get('/exams/available').then((res) => setExams(res.data)).catch(() => {});
    client.get('/exams/results/mine').then((res) => setResults(res.data)).catch(() => {});
  }, []);

  const pendingFees = fees.filter((f) => f.status !== 'paid');

  async function handlePay(installment) {
    setPayingId(installment.id);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Failed to load payment gateway');

      const { data: order } = await client.post('/payments/create-order', { installment_id: installment.id });

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Sufi Infotech',
        description: `${installment.course_title} — installment payment`,
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          await client.post('/payments/verify', {
            installment_id: installment.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          loadFees();
        },
        modal: { ondismiss: () => setPayingId(null) },
      });
      razorpay.open();
    } catch {
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-slate-900 mb-3">Fees</h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {fees.map((f) => (
            <div key={f.id} className="px-4 py-3 flex justify-between items-center text-sm">
              <span>{f.course_title} &middot; Due {f.due_date?.slice(0, 10)}</span>
              <div className="flex items-center gap-3">
                <span className={f.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                  ₹{f.amount} — {f.status}
                </span>
                {f.status !== 'paid' && (
                  <button
                    onClick={() => handlePay(f)}
                    disabled={payingId === f.id}
                    className="bg-slate-900 text-white rounded-md px-3 py-1.5 text-xs hover:bg-slate-800 disabled:opacity-50"
                  >
                    {payingId === f.id ? 'Processing...' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {fees.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No fee records yet</p>}
        </div>
        {pendingFees.length > 0 && (
          <p className="text-sm text-amber-600 mt-2">You have {pendingFees.length} pending payment(s).</p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-3">Available Exams</h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {exams.map((e) => {
            const isOpen = new Date(e.scheduled_at) <= new Date();
            return (
              <div key={e.id} className="px-4 py-3 flex justify-between items-center text-sm">
                <div>
                  <span>{e.title} &middot; {e.duration_minutes} min &middot; {e.total_marks} marks</span>
                  {Number(e.negative_marks) > 0 && (
                    <span className="text-xs text-rose-500 ml-2">(-{e.negative_marks} per wrong answer)</span>
                  )}
                  {!isOpen && (
                    <p className="text-xs text-amber-600 mt-0.5">Opens {new Date(e.scheduled_at).toLocaleString()}</p>
                  )}
                </div>
                {isOpen ? (
                  <Link to={`/student/exams/${e.id}`} className="text-slate-900 underline shrink-0">Start</Link>
                ) : (
                  <span className="text-xs text-slate-400 shrink-0">Not started</span>
                )}
              </div>
            );
          })}
          {exams.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No exams available right now</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-slate-900 mb-3">My Results</h2>
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {results.map((r) => (
            <div key={r.attempt_id} className="px-4 py-3 flex justify-between text-sm">
              <span>{r.exam_title}</span>
              <span className={r.score >= r.pass_marks ? 'text-green-600' : 'text-red-600'}>
                {r.score} / {r.total_marks}
              </span>
            </div>
          ))}
          {results.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No results yet</p>}
        </div>
      </section>
    </div>
  );
}
