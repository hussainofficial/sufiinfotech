import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import client from '../../api/client';

export default function AdminAnalytics() {
  const [revenue, setRevenue] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    client.get('/dashboard/revenue-by-month').then((res) => setRevenue(res.data)).catch(() => {});
    client.get('/dashboard/enquiries-by-course').then((res) => setEnquiries(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Revenue by Month</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Enquiries by Course</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={enquiries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="title" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="enquiry_count" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
