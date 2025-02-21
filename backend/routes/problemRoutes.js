const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/problemController');

router.use(authMiddleware);

// Problem Routes
router.get('/problems', getAllProblems);
router.get('/problems/:problemId', getProblemById);
router.post('/problems', createProblem);
router.put('/problems/:problemId', updateProblem);
router.delete('/problems/:problemId', deleteProblem);

// Topic Routes
router.get('/topics', getAllTopics);
router.get('/topics/:topicId', getTopicById);
router.post('/topics', createTopic);
router.put('/topics/:topicId', updateTopic);
router.delete('/topics/:topicId', deleteTopic);

module.exports = router;
