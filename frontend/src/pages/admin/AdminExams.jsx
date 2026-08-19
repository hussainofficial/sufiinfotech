import { useEffect, useState } from 'react';
import client from '../../api/client';

const emptyQuestion = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 1 };

export default function AdminExams() {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [examForm, setExamForm] = useState({ course_id: '', title: '', duration_minutes: 30, pass_marks: 0 });
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState(emptyQuestion);

  function loadExams() {
    client.get('/exams').then((res) => setExams(res.data)).catch(() => {});
  }

  useEffect(() => {
    client.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    loadExams();
  }, []);

  async function handleCreateExam(e) {
    e.preventDefault();
    await client.post('/exams', examForm);
    setExamForm({ course_id: '', title: '', duration_minutes: 30, pass_marks: 0 });
    loadExams();
  }

  function openExam(exam) {
    setSelectedExam(exam);
    client.get(`/exams/${exam.id}/questions`).then((res) => setQuestions(res.data)).catch(() => {});
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    await client.post(`/exams/${selectedExam.id}/questions`, qForm);
    setQForm(emptyQuestion);
    openExam(selectedExam);
    loadExams();
  }

  async function handleDeleteQuestion(id) {
    await client.delete(`/exams/questions/${id}`);
    openExam(selectedExam);
    loadExams();
  }

  async function handlePublish(examId) {
    await client.patch(`/exams/${examId}/publish`);
    loadExams();
    if (selectedExam?.id === examId) setSelectedExam({ ...selectedExam, is_published: true });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Exams</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Create Exam</h2>
          <form onSubmit={handleCreateExam} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <select required value={examForm.course_id} onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm">
              <option value="">Select course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input required placeholder="Exam title" value={examForm.title}
              onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            <div className="flex gap-3">
              <input type="number" placeholder="Duration (min)" value={examForm.duration_minutes}
                onChange={(e) => setExamForm({ ...examForm, duration_minutes: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
              <input type="number" placeholder="Pass marks" value={examForm.pass_marks}
                onChange={(e) => setExamForm({ ...examForm, pass_marks: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Create Exam</button>
          </form>

          <div className="mt-4 space-y-2">
            {exams.map((ex) => (
              <button
                key={ex.id}
                onClick={() => openExam(ex)}
                className={`w-full text-left bg-white border rounded-lg p-3 text-sm transition-colors ${
                  selectedExam?.id === ex.id ? 'border-slate-900' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{ex.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${ex.is_published ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {ex.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ex.course_title} &middot; {ex.question_count} question(s) &middot; {ex.total_marks} marks</p>
              </button>
            ))}
            {exams.length === 0 && <p className="text-sm text-slate-400">No exams yet</p>}
          </div>
        </div>

        <div>
          {!selectedExam ? (
            <p className="text-sm text-slate-400">Select an exam to manage its questions.</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900">{selectedExam.title} — Questions</h2>
                {!selectedExam.is_published && (
                  <button onClick={() => handlePublish(selectedExam.id)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700">
                    Publish Exam
                  </button>
                )}
              </div>

              <form onSubmit={handleAddQuestion} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 mb-4">
                <textarea required placeholder="Question text" value={qForm.question_text}
                  onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" rows={2} />
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <input
                    key={opt}
                    required
                    placeholder={`Option ${opt.toUpperCase()}`}
                    value={qForm[`option_${opt}`]}
                    onChange={(e) => setQForm({ ...qForm, [`option_${opt}`]: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                  />
                ))}
                <div className="flex gap-3">
                  <select value={qForm.correct_option} onChange={(e) => setQForm({ ...qForm, correct_option: e.target.value })}
                    className="border border-slate-300 rounded-md px-3 py-2 text-sm">
                    {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>Correct: {o}</option>)}
                  </select>
                  <input type="number" placeholder="Marks" value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <button className="bg-slate-900 text-white rounded-md py-2 px-4 text-sm hover:bg-slate-800">Add Question</button>
              </form>

              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-slate-900">{i + 1}. {q.question_text}</p>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs text-red-500 hover:underline shrink-0">Delete</button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Correct: {q.correct_option} &middot; {q.marks} marks</p>
                  </div>
                ))}
                {questions.length === 0 && <p className="text-sm text-slate-400">No questions added yet</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
