import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/trainer/dashboard', label: 'My Batches', icon: '📚' },
  { to: '/trainer/attendance', label: 'Attendance', icon: '🗓️' },
  { to: '/trainer/materials', label: 'Study Materials', icon: '📁' },
  { to: '/trainer/assignments', label: 'Assignments', icon: '📝' },
  { to: '/trainer/settings', label: 'Settings', icon: '⚙️' },
];

export default function TrainerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/trainer/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">
            Sufi <span className="text-emerald-400">Infotech</span> — Trainer Portal
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">{user?.name}</span>
            <Link to="/" className="hover:text-white">Website ↗</Link>
            <button onClick={handleLogout} className="hover:text-white">Logout</button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
