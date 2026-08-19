import { useEffect, useMemo, useState } from 'react';
import client from '../../api/client';

export default function TrainerMaterials() {
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const myCourses = useMemo(() => {
    const map = new Map();
    batches.forEach((b) => map.set(b.course_id, b.course_title));
    return Array.from(map, ([id, title]) => ({ id, title }));
  }, [batches]);

  function load() {
    client.get('/courses/batches/mine').then((res) => setBatches(res.data)).catch(() => {});
    client.get('/study-materials').then((res) => setMaterials(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!courseId || !title || !file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('title', title);
    formData.append('file', file);
    try {
      await client.post('/study-materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle('');
      setFile(null);
      load();
    } finally {
      setUploading(false);
    }
  }

  const myMaterials = materials.filter((m) => myCourses.some((c) => c.id === m.course_id));

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Study Materials</h1>

      <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 max-w-md mb-6">
        <select required value={courseId} onChange={(e) => setCourseId(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
          <option value="">Select course</option>
          {myCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
        <input required type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm" />
        <button disabled={uploading} className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800 disabled:opacity-50">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {myMaterials.map((m) => (
          <div key={m.id} className="px-4 py-3 flex justify-between text-sm">
            <span>{m.title} <span className="text-slate-400">({m.course_title})</span></span>
            <a href={m.file_url} target="_blank" rel="noreferrer" className="text-slate-900 underline">View</a>
          </div>
        ))}
        {myMaterials.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No materials uploaded yet</p>}
      </div>
    </div>
  );
}
