import React from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Bookmark, CheckCircle, ArrowLeft } from 'lucide-react';

const Dashboard = () => {
  const { topics, setSelectedProblem, selectedProblem } = useStore();
  const navigate = useNavigate();

  const allProblems = topics.flatMap((topic) => Object.values(topic.problems));
  const totalProblems = allProblems.length;
  const solvedProblems = allProblems.filter((problem) => problem.isSolved);
  const solvedCount = solvedProblems.length;
  const favoriteProblems = allProblems.filter((problem) => problem.isFavorite);
  const savedProblems = allProblems.filter(
    (problem) => problem.isSavedForLater
  );

  const handleProblemClick = (problemId) => {
    const topic = topics.find((t) =>
      Object.values(t.problems).some((p) => p.problemId === problemId)
    );
    if (topic) {
      const problem = Object.values(topic.problems).find(
        (p) => p.problemId === problemId
      );
      if (problem) {
        setSelectedProblem(problem);
        navigate(`/problem/${problemId}`);
      }
    }
  };

  const handleBackButtonClick = () => {
    if (selectedProblem) {
      setSelectedProblem(null);
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Arrow */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBackButtonClick}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Problems
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalProblems}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Solved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {solvedCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Favorites
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {favoriteProblems.length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Saved for Later
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {savedProblems.length}
                </p>
              </div>
              <Bookmark className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Problems Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Favorite Problems
            </h2>
            <div className="space-y-2">
              {favoriteProblems.length > 0 ? (
                favoriteProblems.map((problem) => (
                  <button
                    key={problem.problemId}
                    onClick={() => handleProblemClick(problem.problemId)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {problem.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {problem.difficulty}
                        </p>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No favorite problems yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Saved for Later
            </h2>
            <div className="space-y-2">
              {savedProblems.length > 0 ? (
                savedProblems.map((problem) => (
                  <button
                    key={problem.problemId}
                    onClick={() => handleProblemClick(problem.problemId)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {problem.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {problem.difficulty}
                        </p>
                      </div>
                      <Bookmark className="w-5 h-5 text-blue-500" />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No problems saved for later
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Solved Problems
            </h2>
            <div className="space-y-2">
              {solvedProblems.length > 0 ? (
                solvedProblems.map((problem) => (
                  <button
                    key={problem.problemId}
                    onClick={() => handleProblemClick(problem.problemId)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {problem.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {problem.difficulty}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No solved problems yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
