import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import TrainerLayout from './components/TrainerLayout';

import Home from './pages/Home';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminAdmissions from './pages/admin/AdminAdmissions';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminFees from './pages/admin/AdminFees';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminStudyMaterials from './pages/admin/AdminStudyMaterials';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminExams from './pages/admin/AdminExams';
import AdminNotices from './pages/admin/AdminNotices';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminSettings from './pages/admin/AdminSettings';

import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import ExamAttempt from './pages/student/ExamAttempt';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentNotices from './pages/student/StudentNotices';
import StudentCertificates from './pages/student/StudentCertificates';
import StudentSettings from './pages/student/StudentSettings';

import TrainerLogin from './pages/trainer/TrainerLogin';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerAttendance from './pages/trainer/TrainerAttendance';
import TrainerMaterials from './pages/trainer/TrainerMaterials';
import TrainerAssignments from './pages/trainer/TrainerAssignments';
import TrainerSettings from './pages/trainer/TrainerSettings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="trainers" element={<AdminTrainers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="materials" element={<AdminStudyMaterials />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exams/:examId" element={<ExamAttempt />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="materials" element={<StudentMaterials />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="settings" element={<StudentSettings />} />
          </Route>

          <Route path="/trainer/login" element={<TrainerLogin />} />
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRole="trainer">
                <TrainerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="attendance" element={<TrainerAttendance />} />
            <Route path="materials" element={<TrainerMaterials />} />
            <Route path="assignments" element={<TrainerAssignments />} />
            <Route path="settings" element={<TrainerSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
