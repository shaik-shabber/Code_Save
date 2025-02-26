import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Authentication & UI state
      user: null,
      token: null,
      topics: [],
      selectedTopic: null,
      selectedProblem: null,
      isSidebarVisible: true,
      isDarkMode: false,
      searchResults: [],
      isAuthenticated: false,

      // Set user and token (user id is used for subsequent API calls)
      setUser: (user, token = null) =>
        set({ user, token, isAuthenticated: !!token }),

      // Clear persisted data on logout
      logout: () => {
        localStorage.removeItem('coding-notes-storage');
        set({ user: null, token: null, isAuthenticated: false, topics: [] });
      },

      // --------------------------
      // TOPICS FUNCTIONS
      // --------------------------

      // Fetch topics for the authenticated user
      fetchTopics: async () => {
        try {
          const token = get().token;
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/topics`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (res.ok) {
            const topicsData = await res.json();
            // Format topics (adjust according to your backend schema)
            const formattedTopics = topicsData.map((topic) => ({
              topicId: topic.topicId || topic._id,
              title: topic.title,
              userId: topic.userId,
              problems: topic.problems || {},
            }));
            set({ topics: formattedTopics });
          } else {
            const errorText = await res.text();
            console.error('Failed to fetch topics:', errorText);
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      },

      // Create a new topic with a generated topicId and a default picid
      addTopic: async (title) => {
        try {
          const token = get().token;
          const user = get().user;
          // Generate a unique topicId using userId, timestamp, and a random string.
          const topicId = `${user._id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/topics`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ 
                topicId,
                title, 
                userId: user ? user._id : null, 
                picid: 'defaultPicId' 
              }),
            }
          );
          if (res.ok) {
            const newTopic = await res.json();
            set((state) => ({
              topics: [...state.topics, { ...newTopic, problems: {} }],
            }));
          } else {
            const errorText = await res.text();
            console.error('Failed to add topic:', errorText);
          }
        } catch (error) {
          console.error('Error adding topic:', error);
        }
      },

      // Delete a topic
      deleteTopic: async (topicId) => {
        try {
          const token = get().token;
          await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/topics/${topicId}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );
        } catch (error) {
          console.error('Error deleting topic on backend:', error);
        }
        set((state) => ({
          topics: state.topics.filter((topic) => topic.topicId !== topicId),
        }));
      },

      // --------------------------
      // PROBLEMS FUNCTIONS
      // --------------------------

      // Fetch all problems and merge them into their topics
      fetchProblems: async () => {
        try {
          const token = get().token;
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/problems`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (res.ok) {
            const problems = await res.json();
            set((state) => {
              // Reset problems in each topic
              const topics = state.topics.map((topic) => ({
                ...topic,
                problems: {},
              }));
              // Merge each problem into its corresponding topic
              problems.forEach((problem) => {
                const topicIndex = topics.findIndex(
                  (t) => t.topicId === problem.topicId
                );
                if (topicIndex > -1) {
                  topics[topicIndex].problems[problem.problemId] = problem;
                } else {
                  topics.push({
                    topicId: problem.topicId,
                    title: problem.topicTitle || problem.topicId,
                    userId: problem.userId,
                    problems: { [problem.problemId]: problem },
                  });
                }
              });
              return { topics };
            });
          } else {
            const errorText = await res.text();
            console.error('Failed to fetch problems:', errorText);
          }
        } catch (error) {
          console.error('Error fetching problems:', error);
        }
      },

      // Create a new problem with a unique problemId.
      // If the statement is missing or empty, set a default value.
      createProblem: async (problemData) => {
        try {
          const user = get().user;
          const token = get().token;
          // Generate a random string of 6 characters for uniqueness.
          const randomPart = Math.random().toString(36).substring(2, 8);
          // Construct the problemId: userId_topicId_random
          const problemId = `${user._id}_${problemData.topicId}_${randomPart}`;
          const payload = { 
            ...problemData, 
            userId: user ? user._id : null,
            // Ensure statement is provided. If empty, provide a default message.
            statement: problemData.statement && problemData.statement.trim() !== ""
              ? problemData.statement
              : "No statement provided",
            problemId 
          };
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/problems`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );
          if (res.ok) {
            const newProblem = await res.json();
            set((state) => {
              const topics = [...state.topics];
              const topicIndex = topics.findIndex(
                (t) => t.topicId === newProblem.topicId
              );
              if (topicIndex > -1) {
                topics[topicIndex] = {
                  ...topics[topicIndex],
                  problems: {
                    ...topics[topicIndex].problems,
                    [newProblem.problemId]: newProblem,
                  },
                };
              } else {
                topics.push({
                  topicId: newProblem.topicId,
                  title: problemData.topicTitle || newProblem.topicId,
                  userId: user ? user._id : null,
                  problems: { [newProblem.problemId]: newProblem },
                });
              }
              return { topics };
            });
          } else {
            const errorText = await res.text();
            console.error('Failed to create problem:', errorText);
          }
        } catch (error) {
          console.error('Error creating problem:', error);
        }
      },

      // Update a problem
      updateProblem: async (topicId, problemId, updates) => {
        try {
          const token = get().token;
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/problems/${problemId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(updates),
            }
          );
          if (res.ok) {
            const updatedProblem = await res.json();
            set((state) => ({
              topics: state.topics.map((topic) =>
                topic.topicId === topicId
                  ? {
                      ...topic,
                      problems: {
                        ...topic.problems,
                        [problemId]: updatedProblem,
                      },
                    }
                  : topic
              ),
              selectedProblem:
                state.selectedProblem &&
                state.selectedProblem.problemId === problemId
                  ? updatedProblem
                  : state.selectedProblem,
            }));
          } else {
            const errorText = await res.text();
            console.error('Failed to update problem:', errorText);
          }
        } catch (error) {
          console.error('Error updating problem:', error);
        }
      },

      // Delete a problem
      deleteProblem: async (topicId, problemId) => {
        try {
          const token = get().token;
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/problems/problems/${problemId}`,
            {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            }
          );
          if (res.ok) {
            set((state) => {
              const topics = state.topics.map((topic) => {
                if (topic.topicId === topicId) {
                  const newProblems = Object.fromEntries(
                    Object.entries(topic.problems).filter(
                      ([key]) => key !== problemId
                    )
                  );
                  return { ...topic, problems: newProblems };
                }
                return topic;
              });
              return {
                topics: topics.filter(
                  (topic) => Object.keys(topic.problems).length > 0
                ),
                selectedProblem:
                  state.selectedProblem &&
                  state.selectedProblem.problemId === problemId
                    ? null
                    : state.selectedProblem,
              };
            });
          } else {
            const errorText = await res.text();
            console.error('Failed to delete problem:', errorText);
          }
        } catch (error) {
          console.error('Error deleting problem:', error);
        }
      },

      // Alias for creating a problem
      addProblem: async (topicId, problemData) => {
        await get().createProblem({ ...problemData, topicId });
      },

      // --------------------------
      // LOCAL SETTERS & UI HELPERS
      // --------------------------
      setTopics: (topics) => set({ topics }),
      setSelectedTopic: (topic) => set({ selectedTopic: topic }),
      setSelectedProblem: (problem) => set({ selectedProblem: problem }),

      toggleSidebar: () =>
        set({ isSidebarVisible: !get().isSidebarVisible }),

      toggleDarkMode: () => {
        const newDarkMode = !get().isDarkMode;
        set({ isDarkMode: newDarkMode });
        document.documentElement.classList.toggle('dark', newDarkMode);
      },

      // --------------------------
      // SEARCH & FAVORITES
      // --------------------------
      searchProblems: (query) => {
        const state = get();
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        const results = state.topics.flatMap((topic) =>
          Object.values(topic.problems).filter(
            (problem) =>
              problem.title.toLowerCase().includes(query.toLowerCase()) ||
              problem.statement.toLowerCase().includes(query.toLowerCase()) ||
              problem.difficulty.toLowerCase() === query.toLowerCase()
          )
        );
        set({ searchResults: results });
      },

      toggleFavorite: async (problemId) => {
        try {
          const state = get();
          let problem;
          for (const topic of state.topics) {
            if (topic.problems[problemId]) {
              problem = topic.problems[problemId];
              break;
            }
          }
          if (!problem) return;
          const token = state.token;
          const url = `${process.env.REACT_APP_API_URL}/api/users/favorites`;
          const method = problem.isFavorite ? 'DELETE' : 'POST';
          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          });
          if (res.ok) {
            set((state) => ({
              topics: state.topics.map((topic) => {
                if (topic.problems[problemId]) {
                  return {
                    ...topic,
                    problems: {
                      ...topic.problems,
                      [problemId]: {
                        ...topic.problems[problemId],
                        isFavorite: !topic.problems[problemId].isFavorite,
                      },
                    },
                  };
                }
                return topic;
              }),
              selectedProblem:
                state.selectedProblem &&
                state.selectedProblem.problemId === problemId
                  ? {
                      ...state.selectedProblem,
                      isFavorite: !state.selectedProblem.isFavorite,
                    }
                  : state.selectedProblem,
            }));
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      },

      toggleSavedForLater: async (problemId) => {
        try {
          const state = get();
          let problem;
          for (const topic of state.topics) {
            if (topic.problems[problemId]) {
              problem = topic.problems[problemId];
              break;
            }
          }
          if (!problem) return;
          const token = state.token;
          const url = `${process.env.REACT_APP_API_URL}/api/users/saved`;
          const method = problem.isSavedForLater ? 'DELETE' : 'POST';
          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          });
          if (res.ok) {
            set((state) => ({
              topics: state.topics.map((topic) => {
                if (topic.problems[problemId]) {
                  return {
                    ...topic,
                    problems: {
                      ...topic.problems,
                      [problemId]: {
                        ...topic.problems[problemId],
                        isSavedForLater: !topic.problems[problemId].isSavedForLater,
                      },
                    },
                  };
                }
                return topic;
              }),
              selectedProblem:
                state.selectedProblem &&
                state.selectedProblem.problemId === problemId
                  ? {
                      ...state.selectedProblem,
                      isSavedForLater: !state.selectedProblem.isSavedForLater,
                    }
                  : state.selectedProblem,
            }));
          }
        } catch (error) {
          console.error('Error toggling saved for later:', error);
        }
      },

      toggleSolved: async (problemId) => {
        try {
          const state = get();
          let problem;
          for (const topic of state.topics) {
            if (topic.problems[problemId]) {
              problem = topic.problems[problemId];
              break;
            }
          }
          if (!problem) return;
          const token = state.token;
          const url = `${process.env.REACT_APP_API_URL}/api/users/solved`;
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          });
          if (res.ok) {
            set((state) => ({
              topics: state.topics.map((topic) => {
                if (topic.problems[problemId]) {
                  return {
                    ...topic,
                    problems: {
                      ...topic.problems,
                      [problemId]: {
                        ...topic.problems[problemId],
                        isSolved: !topic.problems[problemId].isSolved,
                      },
                    },
                  };
                }
                return topic;
              }),
              selectedProblem:
                state.selectedProblem &&
                state.selectedProblem.problemId === problemId
                  ? {
                      ...state.selectedProblem,
                      isSolved: !state.selectedProblem.isSolved,
                    }
                  : state.selectedProblem,
            }));
          }
        } catch (error) {
          console.error('Error toggling solved:', error);
        }
      },

      // DELETE the solved problem (unmark as solved)
      deleteSolved: async (problemId) => {
        try {
          const state = get();
          let problem;
          for (const topic of state.topics) {
            if (topic.problems[problemId]) {
              problem = topic.problems[problemId];
              break;
            }
          }
          if (!problem) return;
          const token = state.token;
          const url = `${process.env.REACT_APP_API_URL}/api/users/solved`;
          const res = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId }),
          });
          if (res.ok) {
            set((state) => ({
              topics: state.topics.map((topic) => {
                if (topic.problems[problemId]) {
                  return {
                    ...topic,
                    problems: {
                      ...topic.problems,
                      [problemId]: {
                        ...topic.problems[problemId],
                        isSolved: false,
                      },
                    },
                  };
                }
                return topic;
              }),
              selectedProblem:
                state.selectedProblem &&
                state.selectedProblem.problemId === problemId
                  ? {
                      ...state.selectedProblem,
                      isSolved: false,
                    }
                  : state.selectedProblem,
            }));
          }
        } catch (error) {
          console.error('Error deleting solved problem:', error);
        }
      },

      // --------------------------
      // AUTHENTICATION HELPER
      // --------------------------
      verifyToken: async () => {
        const token = get().token;
        if (!token) return false;
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/auth/verify`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          return res.ok;
        } catch (error) {
          console.error('Error verifying token:', error);
          return false;
        }
      },
    }),
    { name: 'coding-notes-storage' }
  )
);

export default useStore;
