import React from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import useStore from '../store/useStore';
import DeleteModal from './DeleteModal';
import { useNavigate } from 'react-router-dom';

const Difficulty = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
};

const Language = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  Cpp: 'cpp',
};

const ErrorModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Error</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ onClose }) => {
  const {
    topics,
    selectedTopic,
    selectedProblem,
    setSelectedTopic,
    setSelectedProblem,
    addTopic,
    deleteTopic,
    deleteProblem,
    addProblem,
    fetchTopic, // Assume you have a fetchTopic method in your store to re-fetch topic details.
  } = useStore();
  const navigate = useNavigate();

  const [expandedTopics, setExpandedTopics] = React.useState(new Set());
  const [isAddingTopic, setIsAddingTopic] = React.useState(false);
  const [newTopicTitle, setNewTopicTitle] = React.useState('');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);
  const [isAddingProblem, setIsAddingProblem] = React.useState({ topicId: '', isAdding: false });
  const [newProblemTitle, setNewProblemTitle] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [showErrorModal, setShowErrorModal] = React.useState(false);

  const toggleTopic = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    newExpanded.has(topicId) ? newExpanded.delete(topicId) : newExpanded.add(topicId);
    setExpandedTopics(newExpanded);
  };

  const handleTopicSelect = (topic, problem) => {
    setSelectedTopic(topic);
    setSelectedProblem(problem);
    if (onClose) onClose();
    navigate(`/problem/${problem.problemId}`);
  };

  const handleAddTopic = async () => {
    const title = newTopicTitle.trim();
    if (!title) return;
    const topicExists = topics.some(
      (topic) => topic.title.toLowerCase() === title.toLowerCase()
    );
    if (topicExists) {
      setErrorMessage('Topic already exists');
      setShowErrorModal(true);
      return;
    }
    try {
      await addTopic(title);
      setNewTopicTitle('');
      setIsAddingTopic(false);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleDeleteItem = (e, type, id, topicId) => {
    e.preventDefault();
    e.stopPropagation();
    setItemToDelete({ type, id, topicId });
    setShowDeleteModal(true);
  };

  const handleAddProblem = (topicId, e) => {
    e.stopPropagation();
    if (!expandedTopics.has(topicId)) {
      setExpandedTopics((prev) => new Set(prev).add(topicId));
    }
    setIsAddingProblem({ topicId, isAdding: true });
  };

  // Create a dummy problem and immediately navigate to the editor.
  // Now, the problem opens in edit mode by adding ?edit=true.
  const confirmAddProblem = async () => {
    const title = newProblemTitle.trim();
    if (!title || !isAddingProblem.topicId) return;
    const topic = topics.find((t) => t.topicId === isAddingProblem.topicId);
    if (topic) {
      const problemExists = Object.values(topic.problems).some(
        (problem) => problem.title.toLowerCase() === title.toLowerCase()
      );
      if (problemExists) {
        setErrorMessage('Problem already exists in this topic');
        setShowErrorModal(true);
        return;
      }
    }
    try {
      const dummyProblem = {
        title,
        statement: 'No statement provided',
        difficulty: Difficulty.Medium,
        constraints: '',
        explanation: '',
        code: '',
        language: Language.JavaScript,
        timeComplexity: '',
        spaceComplexity: '',
      };
      // Save the new problem (assuming addProblem returns the created problem object)
      const newProblem = await addProblem(isAddingProblem.topicId, dummyProblem);
      setNewProblemTitle('');
      setIsAddingProblem({ topicId: '', isAdding: false });

      // Validate the returned problemId; if invalid, re-fetch the topic details.
      let validProblemId = newProblem.problemId;
      if (
        !validProblemId ||
        typeof validProblemId !== 'string' ||
        validProblemId.trim() === ''
      ) {
        const updatedTopic = await fetchTopic(isAddingProblem.topicId);
        const foundProblem = Object.values(updatedTopic.problems).find(
          (problem) => problem.title.toLowerCase() === title.toLowerCase()
        );
        if (foundProblem) {
          validProblemId = foundProblem.problemId;
          setSelectedTopic(updatedTopic);
          setSelectedProblem(foundProblem);
        } else {
          throw new Error('Newly added problem not found in topic');
        }
      } else if (topic) {
        setSelectedTopic(topic);
        setSelectedProblem(newProblem);
      }

      // Navigate to ProblemEditor with the edit query parameter so it opens in edit mode.
      navigate(`/problem/${validProblemId}?edit=true`);
    } catch (error) {
      console.error('Error adding problem:', error);
    }
  };

  return (
    <>
      <div className="fixed lg:relative z-10 w-80 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Topics</h2>
            <button
              onClick={() => setIsAddingTopic(true)}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>
          {isAddingTopic && (
            <div className="mt-2">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTopic();
                  if (e.key === 'Escape') {
                    setIsAddingTopic(false);
                    setNewTopicTitle('');
                  }
                }}
                placeholder="Enter topic name..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddTopic}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingTopic(false);
                    setNewTopicTitle('');
                  }}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {topics.map((topic) => (
            <div key={topic.topicId}>
              <div
                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => toggleTopic(topic.topicId)}
              >
                <div className="flex items-center">
                  {expandedTopics.has(topic.topicId) ? (
                    <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                  )}
                  <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200 break-words">
                    {topic.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleAddProblem(topic.topicId, e)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Problem
                  </button>
                  <button
                    onClick={(e) => handleDeleteItem(e, 'topic', topic.topicId)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {expandedTopics.has(topic.topicId) && (
                <div className="ml-8">
                  {Object.entries(topic.problems).map(([problemId, problem]) => (
                    <div key={problemId} className="flex items-center justify-between">
                      <button
                        onClick={() => handleTopicSelect(topic, problem)}
                        className={`w-full text-left p-2 text-sm rounded-md ${
                          selectedTopic?.topicId === topic.topicId &&
                          selectedProblem?.problemId === problem.problemId
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } truncate`}
                      >
                        {problem.title}
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(e, 'problem', problemId, topic.topicId)}
                        className="p-1 ml-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {isAddingProblem.topicId === topic.topicId && (
                    <div className="p-2">
                      <input
                        type="text"
                        value={newProblemTitle}
                        onChange={(e) => setNewProblemTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmAddProblem();
                          if (e.key === 'Escape') {
                            setIsAddingProblem({ topicId: '', isAdding: false });
                            setNewProblemTitle('');
                          }
                        }}
                        placeholder="Enter problem name..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={confirmAddProblem}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingProblem({ topicId: '', isAdding: false });
                            setNewProblemTitle('');
                          }}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        onConfirm={() => {
          if (itemToDelete) {
            if (itemToDelete.type === 'topic') {
              // If the deleted topic is currently open, clear selections and navigate to a safe route.
              if (selectedTopic && selectedTopic.topicId === itemToDelete.id) {
                setSelectedTopic(null);
                setSelectedProblem(null);
                navigate('/'); // Adjust the route as needed.
              }
              deleteTopic(itemToDelete.id);
            } else if (itemToDelete.type === 'problem' && itemToDelete.topicId) {
              // If the deleted problem is currently open, clear the selection.
              if (selectedProblem && selectedProblem.problemId === itemToDelete.id) {
                setSelectedProblem(null);
                navigate('/'); // Adjust the route as needed.
              }
              deleteProblem(itemToDelete.topicId, itemToDelete.id);
            }
            setItemToDelete(null);
            setShowDeleteModal(false);
          }
        }}
        itemType={itemToDelete ? itemToDelete.type : ''}
      />

      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
};

export default Sidebar;
