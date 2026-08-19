import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/enquiries', label: 'Enquiries', icon: '📥' },
  { to: '/admin/admissions', label: 'Admissions', icon: '🧾' },
  { to: '/admin/students', label: 'Students', icon: '🧑‍🎓' },
  { to: '/admin/trainers', label: 'Trainers', icon: '🧑‍🏫' },
  { to: '/admin/courses', label: 'Courses & Batches', icon: '📚' },
  { to: '/admin/attendance', label: 'Attendance', icon: '🗓️' },
  { to: '/admin/materials', label: 'Study Materials', icon: '📁' },
  { to: '/admin/assignments', label: 'Assignments', icon: '📝' },
  { to: '/admin/exams', label: 'Exams', icon: '🧠' },
  { to: '/admin/fees', label: 'Fees', icon: '💳' },
  { to: '/admin/certificates', label: 'Certificates', icon: '🎓' },
  { to: '/admin/notices', label: 'Notices', icon: '📣' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white flex flex-col">
        <Link to="/" className="px-5 py-5 text-lg font-semibold border-b border-white/10 hover:opacity-80 transition-opacity">
          Sufi <span className="text-indigo-400">Infotech</span>
        </Link>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/10'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-sm space-y-2">
          <p className="text-slate-400">{user?.name}</p>
          <Link to="/" className="block text-slate-300 hover:text-white">View Website ↗</Link>
          <button onClick={handleLogout} className="text-slate-300 hover:text-white">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-x-hidden">
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
