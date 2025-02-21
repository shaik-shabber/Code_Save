import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import useStore from '../store/useStore';

const AddProblem = () => {
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [constraints, setConstraints] = useState('');
  const [explanation, setExplanation] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('Easy');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  
  const { addProblem, selectedTopic } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      alert("Please select a topic before adding a problem.");
      return;
    }
    
    const newProblem = {
      title,
      statement,
      constraints,
      explanation,
      code,
      language,
      difficulty,
      timeComplexity,
      spaceComplexity,
    };
    
    addProblem(selectedTopic.topicId, newProblem);
    
    // Optionally clear the form after adding the problem:
    setTitle('');
    setStatement('');
    setConstraints('');
    setExplanation('');
    setCode('');
    setLanguage('javascript');
    setDifficulty('Easy');
    setTimeComplexity('');
    setSpaceComplexity('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Add New Problem
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-200 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter problem title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Problem Statement */}
          <div>
            <label htmlFor="statement" className="block text-gray-700 dark:text-gray-200 mb-2">
              Problem Statement
            </label>
            <textarea
              id="statement"
              placeholder="Describe the problem"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={4}
              required
            />
          </div>

          {/* Constraints */}
          <div>
            <label htmlFor="constraints" className="block text-gray-700 dark:text-gray-200 mb-2">
              Constraints
            </label>
            <textarea
              id="constraints"
              placeholder="List any constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={3}
            />
          </div>

          {/* Explanation */}
          <div>
            <label htmlFor="explanation" className="block text-gray-700 dark:text-gray-200 mb-2">
              Explanation
            </label>
            <textarea
              id="explanation"
              placeholder="Provide a detailed explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={4}
            />
          </div>

          {/* Code Editor */}
          <div>
            <label htmlFor="code" className="block text-gray-700 dark:text-gray-200 mb-2">
              Code
            </label>
            <Editor
              height="200px"
              defaultLanguage={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={useStore.getState().isDarkMode ? 'vs-dark' : 'light'}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>

          {/* Language, Difficulty, Time & Space Complexity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-gray-700 dark:text-gray-200 mb-2">
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-gray-700 dark:text-gray-200 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label htmlFor="timeComplexity" className="block text-gray-700 dark:text-gray-200 mb-2">
                Time Complexity
              </label>
              <input
                type="text"
                id="timeComplexity"
                placeholder="e.g., O(n)"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <div>
              <label htmlFor="spaceComplexity" className="block text-gray-700 dark:text-gray-200 mb-2">
                Space Complexity
              </label>
              <input
                type="text"
                id="spaceComplexity"
                placeholder="e.g., O(1)"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="mt-6 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none focus:ring"
            >
              Add Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblem;
