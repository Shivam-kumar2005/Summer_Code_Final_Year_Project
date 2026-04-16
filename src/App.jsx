import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TeachingProvider } from './contexts/TeachingContext';
import MainLayout from './components/MainLayout';
import LandingPage from './pages/LandingPage';
import AvailableCoursesPage from './pages/AvailableCoursesPage';
import LessonPage from './pages/LessonPage';
import AdminPage from './pages/AdminPage';
import AdminLessonEditor from './pages/AdminLessonEditor';

function App() {
  return (
    <BrowserRouter>
      <TeachingProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<AvailableCoursesPage />} />
          <Route path="/lessons/:slug" element={<MainLayout><LessonPage /></MainLayout>} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/lesson/:slug" element={<AdminLessonEditor />} />
        </Routes>
      </TeachingProvider>
    </BrowserRouter>
  );
}

export default App;



