import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminCertificates() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [issued, setIssued] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/students').then((res) => setStudents(res.data)).catch(() => {});
    client.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
  }, []);

  async function handleIssue(e) {
    e.preventDefault();
    setError('');
    setIssued(null);
    try {
      const res = await client.post('/certificates', { student_id: studentId, course_id: courseId });
      setIssued(res.data);
    } catch {
      setError('Could not issue certificate');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Certificates</h1>

      <form onSubmit={handleIssue} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md">
        <select required value={studentId} onChange={(e) => setStudentId(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
        </select>
        <select required value={courseId} onChange={(e) => setCourseId(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Issue Certificate</button>
      </form>

      {issued && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm max-w-md">
          <p className="text-green-700">Certificate issued: <b>{issued.certificate_code}</b></p>
          <a href={issued.file_url} target="_blank" rel="noreferrer" className="text-slate-900 underline">Download PDF</a>
        </div>
      )}
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
    </div>
  );
}
