import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import HeroShowcase from '../components/HeroShowcase';

const features = [
  { icon: '💻', title: 'Hands-on Training', desc: 'Practical, lab-based learning — not just theory.', color: 'bg-indigo-100 text-indigo-600' },
  { icon: '🎓', title: 'Certified Courses', desc: 'Get a verifiable certificate on course completion.', color: 'bg-purple-100 text-purple-600' },
  { icon: '📝', title: 'Online Exams', desc: 'Timed, auto-graded tests to track your progress.', color: 'bg-amber-100 text-amber-600' },
  { icon: '🤝', title: 'Placement Support', desc: 'Guidance and support to help you get hired.', color: 'bg-emerald-100 text-emerald-600' },
];

const courseAccents = [
  { bar: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-600' },
  { bar: 'bg-purple-500', chip: 'bg-purple-50 text-purple-600' },
  { bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-600' },
  { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600' },
  { bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600' },
  { bar: 'bg-sky-500', chip: 'bg-sky-50 text-sky-600' },
];

const courseIcons = ['💻', '🎨', '📊', '🌐', '🔐', '📱', '🖥️', '⚙️'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', course_id: '', message: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    client.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  function handleEnroll(courseId) {
    setForm((f) => ({ ...f, course_id: String(courseId) }));
    document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      await client.post('/enquiries', form);
      setStatus('success');
      setForm({ name: '', phone: '', email: '', course_id: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            Sufi <span className="text-indigo-600">Infotech</span>
          </span>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link to="/student/login" className="px-3 py-1.5 rounded-full text-slate-600 hover:text-indigo-600 transition-colors">
              Student Login
            </Link>
            <Link to="/trainer/login" className="px-3 py-1.5 rounded-full text-slate-600 hover:text-indigo-600 transition-colors">
              Trainer Login
            </Link>
            <Link
              to="/admin/login"
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-amber-50" />
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl -z-10"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-40 -left-24 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl -z-10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl -z-10"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide mb-6"
            >
              ADMISSIONS OPEN
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            >
              Learn. Certify.<br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                Get Placed.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              className="mt-6 text-lg text-slate-600 max-w-lg mx-auto lg:mx-0"
            >
              Industry-relevant computer courses with hands-on training, online exams,
              and placement support — all in one place.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-4"
            >
              <a
                href="#enquire"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-900/15"
              >
                Enquire Now
              </a>
              <a
                href="#courses"
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                View Courses
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <HeroShowcase />
          </motion.div>
        </div>

        {/* Feature strip */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur border border-slate-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${f.color}`}>
                {f.icon}
              </div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Courses + Enquiry */}
      <section id="courses" className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-baseline justify-between mb-6"
          >
            <h2 className="text-2xl font-bold">Our Courses</h2>
            {courses.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {courses.length} course{courses.length > 1 ? 's' : ''} available
              </span>
            )}
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {courses.length === 0 && (
              <p className="text-sm text-slate-400 col-span-2">Courses will appear here once added by admin.</p>
            )}
            {courses.map((c, i) => {
              const accent = courseAccents[i % courseAccents.length];
              return (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  whileHover={{ y: -6, rotate: -0.5, boxShadow: '0 16px 28px -10px rgba(79,70,229,0.22)' }}
                  className="group relative bg-white rounded-2xl border border-slate-200 p-5 pl-6 overflow-hidden transition-shadow"
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${accent.bar}`} />
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${accent.chip}`}>
                      {courseIcons[i % courseIcons.length]}
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] font-bold tracking-wide text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 mt-3">{c.title}</p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <span>🗓️</span> {c.duration_weeks} weeks
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.chip}`}>
                      ₹{c.fee_amount}
                    </span>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => handleEnroll(c.id)}
                      className="text-xs font-semibold text-slate-500 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity flex items-center gap-1"
                    >
                      Enroll <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          id="enquire"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-7 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-white mb-1">Enquire Now</h3>
          <p className="text-sm text-slate-400 mb-5">We'll get back to you within 24 hours.</p>

          {status === 'success' ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-emerald-400 text-sm"
            >
              Thanks! We've received your enquiry and will contact you soon.
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
              <select
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              >
                <option className="text-slate-900" value="">Select a course (optional)</option>
                {courses.map((c) => (
                  <option className="text-slate-900" key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <textarea
                placeholder="Message (optional)"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                rows={3}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === 'sending'}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'}
              </motion.button>
              {status === 'error' && (
                <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Sufi Infotech. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/student/login" className="hover:text-indigo-600 transition-colors">Student Login</Link>
            <Link to="/trainer/login" className="hover:text-indigo-600 transition-colors">Trainer Login</Link>
            <Link to="/admin/login" className="hover:text-indigo-600 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
