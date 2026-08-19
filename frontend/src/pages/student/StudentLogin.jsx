import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post('/auth/student/login', { email, password });
      login({ token: res.data.token, user: res.data.user, role: 'student' });
      navigate('/student/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 px-4 overflow-hidden">
      <motion.div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-200/40 blur-3xl -z-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-200/40 blur-3xl -z-10"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/" className="mb-6 block text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          ← Back to website
        </Link>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white/90 backdrop-blur p-8 rounded-2xl border border-slate-200 w-full max-w-sm shadow-xl shadow-indigo-900/5"
      >
        <h1 className="text-xl font-semibold text-slate-900 mb-6">Student Login</h1>
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
        />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Login
        </motion.button>
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/admin/login" className="text-indigo-600 hover:underline">Admin login</Link>
          {' · '}
          <Link to="/trainer/login" className="text-indigo-600 hover:underline">Trainer login</Link>
        </p>
      </motion.form>
    </div>
  );
}
