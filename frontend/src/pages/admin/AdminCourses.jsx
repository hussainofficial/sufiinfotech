import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', duration_weeks: '', fee_amount: '' });
  const [batchForm, setBatchForm] = useState({ course_id: '', name: '', start_date: '', end_date: '', timing: '', seats_total: 30 });

  function load() {
    client.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    client.get('/courses/batches/all').then((res) => setBatches(res.data)).catch(() => {});
  }

  useEffect(() => { load(); }, []);

  async function addCourse(e) {
    e.preventDefault();
    await client.post('/courses', courseForm);
    setCourseForm({ title: '', description: '', duration_weeks: '', fee_amount: '' });
    load();
  }

  async function addBatch(e) {
    e.preventDefault();
    await client.post('/courses/batches', batchForm);
    setBatchForm({ course_id: '', name: '', start_date: '', end_date: '', timing: '', seats_total: 30 });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Courses & Batches</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Add Course</h2>
          <form onSubmit={addCourse} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <input required placeholder="Title" value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <input type="number" placeholder="Duration (weeks)" value={courseForm.duration_weeks}
                onChange={(e) => setCourseForm({ ...courseForm, duration_weeks: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input required type="number" placeholder="Fee amount" value={courseForm.fee_amount}
                onChange={(e) => setCourseForm({ ...courseForm, fee_amount: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Add Course</button>
          </form>

          <ul className="mt-4 space-y-2">
            {courses.map((c) => (
              <li key={c.id} className="bg-white border border-slate-200 rounded-lg p-3 text-sm">
                <span className="font-medium text-slate-900">{c.title}</span> &middot; ₹{c.fee_amount} &middot; {c.duration_weeks} weeks
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Add Batch</h2>
          <form onSubmit={addBatch} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <select required value={batchForm.course_id}
              onChange={(e) => setBatchForm({ ...batchForm, course_id: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input required placeholder="Batch name" value={batchForm.name}
              onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <input type="date" value={batchForm.start_date}
                onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input type="date" value={batchForm.end_date}
                onChange={(e) => setBatchForm({ ...batchForm, end_date: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <input placeholder="Timing (e.g. Mon-Fri 10-11am)" value={batchForm.timing}
              onChange={(e) => setBatchForm({ ...batchForm, timing: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <input type="number" placeholder="Total seats" value={batchForm.seats_total}
              onChange={(e) => setBatchForm({ ...batchForm, seats_total: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Add Batch</button>
          </form>

          <ul className="mt-4 space-y-2">
            {batches.map((b) => (
              <li key={b.id} className="bg-white border border-slate-200 rounded-lg p-3 text-sm">
                <span className="font-medium text-slate-900">{b.name}</span> ({b.course_title}) &middot; {b.seats_filled}/{b.seats_total} seats
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
