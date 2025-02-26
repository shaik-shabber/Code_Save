import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Sun, User, Menu } from 'lucide-react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Header = () => {
  const { isDarkMode, toggleDarkMode, searchProblems, searchResults, setSelectedProblem, logout, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      searchProblems(query);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.length > 2) {
      searchProblems(searchQuery);
      setShowSearchResults(true);
    }
  };

  const handleSearchResultClick = (problemId) => {
    const problem = searchResults.find((p) => p.problemId === problemId);
    if (problem) {
      setSelectedProblem(problem);
      navigate(`/problem/${problemId}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setIsSidebarOpen(false);
      }
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isUserMenuOpen]);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            ref={menuButtonRef}
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-white" />
          </button>
          <span className="text-2xl font-bold text-blue-500 dark:text-white">CODE SAVE</span>
        </div>
        <div className="flex-1 relative mx-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                searchResults.map((problem) => (
                  <button
                    key={problem.problemId}
                    onClick={() => handleSearchResultClick(problem.problemId)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white">{problem.title}</div>
                    <div className="text-sm text-gray-500 dark:text-white">{problem.difficulty}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 dark:text-white">No problems found</div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-white" />
            )}
          </button>
          {user && (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <User className="w-6 h-6 text-gray-600 dark:text-white" />
                <span className="text-gray-800 dark:text-white">
                  {user.name || user.email}
                </span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/auth/login');
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isSidebarOpen && (
        <div ref={sidebarRef}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
