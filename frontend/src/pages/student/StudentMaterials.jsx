import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    client.get('/study-materials/mine').then((res) => setMaterials(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Study Materials</h1>
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {materials.map((m) => (
          <div key={m.id} className="px-4 py-3 flex justify-between text-sm">
            <span>{m.title}</span>
            <a href={m.file_url} target="_blank" rel="noreferrer" className="text-slate-900 underline">Download</a>
          </div>
        ))}
        {materials.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No materials available yet</p>}
      </div>
    </div>
  );
}
