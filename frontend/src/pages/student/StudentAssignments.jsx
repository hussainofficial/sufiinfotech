import { useEffect, useState } from 'react';
import client from '../../api/client';
import { fileUrl } from '../../utils/fileUrl';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [files, setFiles] = useState({});

  function load() {
    client.get('/assignments/mine').then((res) => setAssignments(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(assignmentId) {
    const file = files[assignmentId];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await client.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Assignments</h1>
      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900">{a.title}</p>
            <p className="text-sm text-slate-600 mt-1">{a.description}</p>
            <p className="text-xs text-slate-500 mt-1">Due {a.due_date?.slice(0, 10)}</p>

            {a.submission_id ? (
              <div className="mt-3 text-sm">
                <a href={fileUrl(a.submission_file_url)} target="_blank" rel="noreferrer" className="text-slate-900 underline">
                  View my submission
                </a>
                {a.marks != null && <p className="text-green-600 mt-1">Marks: {a.marks}</p>}
                {a.feedback && <p className="text-slate-500 mt-1">Feedback: {a.feedback}</p>}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setFiles({ ...files, [a.id]: e.target.files[0] })}
                  className="text-sm"
                />
                <button
                  onClick={() => handleSubmit(a.id)}
                  className="bg-slate-900 text-white rounded-md px-3 py-1.5 text-xs hover:bg-slate-800"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        ))}
        {assignments.length === 0 && <p className="text-sm text-slate-400">No assignments yet</p>}
      </div>
    </div>
  );
}
