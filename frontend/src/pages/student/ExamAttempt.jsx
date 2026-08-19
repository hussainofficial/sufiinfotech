import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';

export default function ExamAttempt() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    client.post(`/exams/${examId}/start`).then((res) => {
      setAttemptId(res.data.attemptId);
      setExam(res.data.exam);
      setQuestions(res.data.questions);
      setSecondsLeft(res.data.exam.duration_minutes * 60);
    });
  }, [examId]);

  useEffect(() => {
    if (secondsLeft === null || submitted) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, submitted]);

  function selectOption(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit(autoSubmitted = false) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const payload = {
      answers: Object.entries(answers).map(([question_id, selected_option]) => ({
        question_id: Number(question_id),
        selected_option,
      })),
      auto_submitted: autoSubmitted,
    };
    const res = await client.post(`/exams/attempts/${attemptId}/submit`, payload);
    setSubmitted(res.data);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-200 rounded-xl p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Exam Submitted</h1>
        <p className="text-slate-600 mb-6">Your score: <b>{submitted.score}</b> / {exam?.total_marks}</p>
        <button onClick={() => navigate('/student/dashboard')} className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!exam) return <p className="text-slate-500">Loading exam...</p>;

  const minutes = Math.floor((secondsLeft || 0) / 60);
  const seconds = (secondsLeft || 0) % 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50 py-2">
        <h1 className="text-lg font-semibold text-slate-900">{exam.title}</h1>
        <span className="font-mono text-sm bg-slate-900 text-white px-3 py-1 rounded-md">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="font-medium text-slate-900 mb-3">{idx + 1}. {q.question_text}</p>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => selectOption(q.id, opt)}
                  />
                  {q[`option_${opt.toLowerCase()}`]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSubmit(false)}
        className="mt-6 w-full bg-slate-900 text-white rounded-md py-3 text-sm font-medium hover:bg-slate-800"
      >
        Submit Exam
      </button>
    </div>
  );
}
