import React, { useState } from 'react';

const MainPage = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">
      <h1 className="text-5xl font-bold text-blue-500 mb-4 animate-pulse">
        Welcome to Code Save
      </h1>
      <p className="text-xl text-gray-800 dark:text-gray-200 mb-8">
        Your interactive hub to save your codes and access them from anywhere.
      </p>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Learn to code effectively with our engaging animations and interactive features.
      </p>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {showDetails ? "Hide Details" : "Learn More"}
      </button>
      {showDetails && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out">
          <h2 className="text-3xl font-semibold text-blue-500 mb-4">How It Works</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              <span className="font-medium">Save your code:</span> Easily store your code snippets and projects.
            </li>
            <li>
              <span className="font-medium">Access anywhere:</span> Log in from any device to view your saved codes.
            </li>
            <li>
              <span className="font-medium">Learn effectively:</span> Enjoy interactive animations and tutorials that make learning fun.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MainPage;
