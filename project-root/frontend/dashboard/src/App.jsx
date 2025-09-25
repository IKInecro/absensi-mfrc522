import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import Cards from './pages/Cards.jsx';
import Attendance from './pages/Attendance.jsx';
import Settings from './pages/Settings.jsx';

// Components
import Header from './components/Header.jsx';

// Root App: router + layout global
export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-inter">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
