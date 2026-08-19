import { useEffect, useState } from 'react';
import client from '../../api/client';
import { fileUrl } from '../../utils/fileUrl';

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    client.get('/certificates/mine').then((res) => setCertificates(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">My Certificates</h1>
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {certificates.map((c) => (
          <div key={c.id} className="px-4 py-3 flex justify-between text-sm">
            <span>{c.course_title} &middot; {c.certificate_code}</span>
            <a href={fileUrl(c.file_url)} target="_blank" rel="noreferrer" className="text-slate-900 underline">Download</a>
          </div>
        ))}
        {certificates.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No certificates issued yet</p>}
      </div>
    </div>
  );
}
