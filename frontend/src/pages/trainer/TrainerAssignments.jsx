import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function TrainerAssignments() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });
  const [openSubmissions, setOpenSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    client.get('/courses/batches/mine').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  function loadAssignments() {
    if (!batchId) return;
    client.get('/assignments/batch', { params: { batch_id: batchId } }).then((res) => setAssignments(res.data)).catch(() => {});
  }

  useEffect(() => { loadAssignments(); }, [batchId]);

  async function handleCreate(e) {
    e.preventDefault();
    await client.post('/assignments', { ...form, batch_id: batchId });
    setForm({ title: '', description: '', due_date: '' });
    loadAssignments();
  }

  async function viewSubmissions(assignmentId) {
    setOpenSubmissions(assignmentId);
    const res = await client.get(`/assignments/${assignmentId}/submissions`);
    setSubmissions(res.data);
  }

  async function grade(submissionId, marks, feedback) {
    await client.patch(`/assignments/submissions/${submissionId}/grade`, { marks, feedback });
    viewSubmissions(openSubmissions);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Assignments</h1>

      <select value={batchId} onChange={(e) => setBatchId(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm mb-6">
        <option value="">Select batch</option>
        {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.course_title})</option>)}
      </select>

      {batchId && (
        <>
          <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md mb-6">
            <input required placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <input type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Create Assignment</button>
          </form>

          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">Due {a.due_date?.slice(0, 10)}</p>
                  </div>
                  <button onClick={() => viewSubmissions(a.id)} className="text-sm text-slate-900 underline">
                    View Submissions
                  </button>
                </div>

                {openSubmissions === a.id && (
                  <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                    {submissions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <a href={s.file_url} target="_blank" rel="noreferrer" className="text-slate-900 underline">{s.student_name}</a>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={s.marks ?? ''}
                            placeholder="Marks"
                            onBlur={(e) => grade(s.id, e.target.value, s.feedback)}
                            className="w-20 border border-slate-300 rounded-md px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    {submissions.length === 0 && <p className="text-xs text-slate-400">No submissions yet</p>}
                  </div>
                )}
              </div>
            ))}
            {assignments.length === 0 && <p className="text-sm text-slate-400">No assignments for this batch yet</p>}
          </div>
        </>
      )}
    </div>
  );
}
