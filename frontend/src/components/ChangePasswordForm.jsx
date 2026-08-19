import { useState } from 'react';
import client from '../api/client';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus(null);
    if (form.new_password !== form.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    try {
      await client.post('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setStatus('success');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update password');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 max-w-sm">
      <input
        required
        type="password"
        placeholder="Current password"
        value={form.current_password}
        onChange={(e) => setForm({ ...form, current_password: e.target.value })}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
      />
      <input
        required
        type="password"
        placeholder="New password (min. 6 characters)"
        value={form.new_password}
        onChange={(e) => setForm({ ...form, new_password: e.target.value })}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
      />
      <input
        required
        type="password"
        placeholder="Confirm new password"
        value={form.confirm_password}
        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {status === 'success' && <p className="text-green-600 text-sm">Password updated.</p>}
      <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">
        Update Password
      </button>
    </form>
  );
}
