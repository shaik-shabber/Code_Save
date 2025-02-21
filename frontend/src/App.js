import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProblemEditor from './components/ProblemEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import MainPage from './pages/MainPage';
import Footer from './pages/Footer';
import useStore from './store/useStore';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

const AppContent = () => {
  const isDarkMode = useStore((state) => state.isDarkMode);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Hide header and footer on authentication pages (login, register, logout)
  const hideAuthLayout = location.pathname.startsWith('/auth');

  return (
    <div className="min-h-screen bg-lightThemeBackground dark:bg-darkThemeBackground flex flex-col">
      <div className="flex-1">
        {!hideAuthLayout && <Header />}
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/logout" element={<Logout />} />
          <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/problem/:problemId" element={<ProtectedRoute><ProblemEditor /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideAuthLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
