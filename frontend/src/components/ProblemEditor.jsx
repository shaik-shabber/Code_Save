import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Save, Trash2, Star, Bookmark, CheckCircle, Menu } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import DeleteModal from './DeleteModal';

const difficultyColors = {
  Easy: 'text-green-500',
  Medium: 'text-yellow-500',
  Hard: 'text-red-500',
};

const ProblemEditor = ({ edit = false }) => {
  const selectedProblem = useStore((state) => state.selectedProblem);
  const selectedTopic = useStore((state) => state.selectedTopic);
  const updateProblem = useStore((state) => state.updateProblem);
  const deleteProblem = useStore((state) => state.deleteProblem);
  const setSelectedProblem = useStore((state) => state.setSelectedProblem);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const toggleSavedForLater = useStore((state) => state.toggleSavedForLater);
  const toggleSolved = useStore((state) => state.toggleSolved);

  // Initialize edit mode from prop or URL query.
  const [isEditing, setIsEditing] = useState(edit);
  const [editedProblem, setEditedProblem] = useState(selectedProblem);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);

  const [isFavorite, setIsFavorite] = useState(selectedProblem?.isFavorite || false);
  const [isSavedForLater, setIsSavedForLater] = useState(selectedProblem?.isSavedForLater || false);
  const [isSolved, setIsSolved] = useState(selectedProblem?.isSolved || false);

  const containerRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Update local state when the selected problem changes.
  useEffect(() => {
    setEditedProblem(selectedProblem);
    if (selectedProblem) {
      setIsFavorite(selectedProblem.isFavorite);
      setIsSavedForLater(selectedProblem.isSavedForLater);
      setIsSolved(selectedProblem.isSolved);
    }
  }, [selectedProblem]);

  // Auto-enable edit mode if prop "edit" is true or URL has ?edit=true.
  useEffect(() => {
    if (edit || searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [edit, searchParams]);

  // If the current topic becomes empty (or deleted), clear the selected problem.
  useEffect(() => {
    if (selectedTopic && (!selectedTopic.problems || Object.keys(selectedTopic.problems).length === 0)) {
      setSelectedProblem(null);
    }
  }, [selectedTopic, setSelectedProblem]);

  const handleSave = useCallback(() => {
    if (editedProblem && selectedTopic) {
      updateProblem(selectedTopic.topicId, selectedProblem.problemId, editedProblem);
      setIsEditing(false);
    }
  }, [editedProblem, selectedTopic, selectedProblem, updateProblem]);

  const handleDelete = useCallback(() => {
    if (selectedTopic && selectedProblem) {
      deleteProblem(selectedTopic.topicId, selectedProblem.problemId);
      // Look for any remaining problems in the topic.
      const remaining = selectedTopic.problems
        ? Object.values(selectedTopic.problems).filter(
            (problem) => problem.problemId !== selectedProblem.problemId
          )
        : [];
      if (remaining.length > 0) {
        setSelectedProblem(remaining[0]);
      } else {
        setSelectedProblem(null);
      }
      setShowDeleteModal(false);
    }
  }, [selectedTopic, selectedProblem, deleteProblem, setSelectedProblem]);

  const onToggleFavorite = useCallback(() => {
    if (!isEditing && selectedProblem) {
      toggleFavorite(selectedProblem.problemId);
      setIsFavorite((prev) => !prev);
      setEditedProblem((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : prev
      );
    }
  }, [isEditing, selectedProblem, toggleFavorite]);

  const onToggleSavedForLater = useCallback(() => {
    if (!isEditing && selectedProblem) {
      toggleSavedForLater(selectedProblem.problemId);
      setIsSavedForLater((prev) => !prev);
      setEditedProblem((prev) =>
        prev ? { ...prev, isSavedForLater: !prev.isSavedForLater } : prev
      );
    }
  }, [isEditing, selectedProblem, toggleSavedForLater]);

  const onToggleSolved = useCallback(() => {
    if (!isEditing && selectedProblem) {
      toggleSolved(selectedProblem.problemId);
      setIsSolved((prev) => !prev);
      setEditedProblem((prev) =>
        prev ? { ...prev, isSolved: !prev.isSolved } : prev
      );
    }
  }, [isEditing, selectedProblem, toggleSolved]);

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const startX = e.clientX;
      const containerWidth = container.offsetWidth;
      const startRatio = splitRatio;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        let newRatio = startRatio + (deltaX / containerWidth) * 100;
        newRatio = Math.max(10, Math.min(90, newRatio));
        setSplitRatio(newRatio);
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [splitRatio]
  );

  if (!selectedTopic || !selectedProblem) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center p-6 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to CodeSave
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            CodeSave helps you manage your code and problems. Please select a problem or create a new topic.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1 ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editedProblem?.title || ''}
                  onChange={(e) =>
                    setEditedProblem((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
                    )
                  }
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 dark:text-white focus:outline-none focus:border-blue-500 w-full"
                />
              ) : (
                selectedProblem.title
              )}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`${difficultyColors[selectedProblem.difficulty] || 'text-gray-500'} font-medium`}>
                {isEditing ? (
                  <select
                    value={editedProblem?.difficulty || ''}
                    onChange={(e) =>
                      setEditedProblem((prev) =>
                        prev ? { ...prev, difficulty: e.target.value } : prev
                      )
                    }
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                ) : (
                  selectedProblem.difficulty
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isFavorite ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}
              disabled={isEditing}
            >
              <Star className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleSavedForLater}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isSavedForLater ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
              disabled={isEditing}
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={onToggleSolved}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isSolved ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`}
              disabled={isEditing}
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (isEditing) {
                  // Cancel: revert unsaved changes
                  setEditedProblem(selectedProblem);
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex-1 overflow-hidden" ref={containerRef}>
          <div className="h-full flex">
            {/* Left Pane: Problem Details */}
            <div style={{ width: `${splitRatio}%` }} className="overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Problem Statement
                </h2>
                {isEditing ? (
                  <textarea
                    value={editedProblem?.statement || ''}
                    onChange={(e) =>
                      setEditedProblem((prev) =>
                        prev ? { ...prev, statement: e.target.value } : prev
                      )
                    }
                    className="w-full h-32 p-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedProblem.statement}
                  </p>
                )}
              </div>
              <hr className="my-4 border-gray-300 dark:border-gray-600" />
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Constraints
                </h2>
                {isEditing ? (
                  <textarea
                    value={editedProblem?.constraints || ''}
                    onChange={(e) =>
                      setEditedProblem((prev) =>
                        prev ? { ...prev, constraints: e.target.value } : prev
                      )
                    }
                    className="w-full h-24 p-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedProblem.constraints}
                  </p>
                )}
              </div>
              <hr className="my-4 border-gray-300 dark:border-gray-600" />
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Complexity
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Complexity
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProblem?.timeComplexity || ''}
                        onChange={(e) =>
                          setEditedProblem((prev) =>
                            prev ? { ...prev, timeComplexity: e.target.value } : prev
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedProblem.timeComplexity}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Space Complexity
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProblem?.spaceComplexity || ''}
                        onChange={(e) =>
                          setEditedProblem((prev) =>
                            prev ? { ...prev, spaceComplexity: e.target.value } : prev
                          )
                        }
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedProblem.spaceComplexity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <hr className="my-4 border-gray-300 dark:border-gray-600" />
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Explanation
                </h2>
                {isEditing ? (
                  <textarea
                    value={editedProblem?.explanation || ''}
                    onChange={(e) =>
                      setEditedProblem((prev) =>
                        prev ? { ...prev, explanation: e.target.value } : prev
                      )
                    }
                    className="w-full h-32 p-3 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedProblem.explanation}
                  </p>
                )}
              </div>
            </div>
            <div onMouseDown={handleMouseDown} className="w-2 cursor-col-resize bg-gray-300 dark:bg-gray-600" />
            <div style={{ width: `${100 - splitRatio}%` }} className="h-full flex flex-col">
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {isEditing ? (
                  <select
                    value={editedProblem?.language || ''}
                    onChange={(e) =>
                      setEditedProblem((prev) =>
                        prev ? { ...prev, language: e.target.value } : prev
                      )
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                ) : (
                  <span className="text-gray-900 dark:text-white">
                    Language: {selectedProblem.language.charAt(0).toUpperCase() + selectedProblem.language.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage={selectedProblem.language}
                  value={isEditing ? editedProblem?.code : selectedProblem.code}
                  onChange={(value) =>
                    setEditedProblem((prev) =>
                      prev ? { ...prev, code: value || '' } : prev
                    )
                  }
                  theme={useStore.getState().isDarkMode ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    readOnly: !isEditing,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemType="problem"
      />
    </div>
  );
};

export default ProblemEditor;
