import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import client from '../../api/client';

function StatCard({ label, value, icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    client.get('/dashboard/summary').then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  if (!summary) return <p className="text-slate-500">Loading...</p>;

  const stats = [
    { label: 'Total Students', value: summary.totalStudents, icon: '🧑‍🎓', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'New Enquiries', value: summary.newEnquiries, icon: '📥', color: 'bg-sky-100 text-sky-600' },
    { label: 'Conversion Rate', value: `${summary.conversionRate}%`, icon: '📈', color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Batches', value: summary.activeBatches, icon: '📚', color: 'bg-amber-100 text-amber-600' },
    { label: 'Pending Fees', value: `₹${summary.pendingFees}`, icon: '⏳', color: 'bg-rose-100 text-rose-600' },
    { label: 'Revenue Collected', value: `₹${summary.revenueCollected}`, icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
}
