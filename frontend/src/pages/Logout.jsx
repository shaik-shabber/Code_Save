import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Logout = () => {
  const logout = useStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    navigate('/auth/login');
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-800 dark:text-gray-100 text-xl">Logging out...</p>
    </div>
  );
};

export default Logout;
