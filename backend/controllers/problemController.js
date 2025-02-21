const Problem = require('../models/Problem');
const Topic = require('../models/Topic');

// ------------------
// Problem Controllers
// ------------------

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ userId: req.user._id });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      problemId: req.params.problemId,
      userId: req.user._id,
    });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProblem = async (req, res) => {
  try {
    // Attach the authenticated user's ID to the problem data
    const problemData = { ...req.body, userId: req.user._id };
    const newProblem = new Problem(problemData);
    await newProblem.save();

    // Update or create the Topic document.
    let topic = await Topic.findOne({
      topicId: newProblem.topicId,
      userId: req.user._id,
    });
    if (topic) {
      // Add the new problem to the existing topic's problems object.
      topic.problems[newProblem.problemId] = newProblem;
      await topic.save();
    } else {
      // Create a new topic document with the new problem.
      topic = new Topic({
        topicId: newProblem.topicId,
        title: req.body.topicTitle || newProblem.topicId,
        userId: req.user._id,
        problems: { [newProblem.problemId]: newProblem },
      });
      await topic.save();
    }
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const updatedProblem = await Problem.findOneAndUpdate(
      { problemId: req.params.problemId, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedProblem) {
      return res.status(404).json({ message: 'Problem not found or unauthorized' });
    }
    // Update the problem in the corresponding Topic.
    await Topic.findOneAndUpdate(
      { topicId: updatedProblem.topicId, userId: req.user._id },
      { $set: { [`problems.${updatedProblem.problemId}`]: updatedProblem } }
    );
    res.json(updatedProblem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const deletedProblem = await Problem.findOneAndDelete({
      problemId: req.params.problemId,
      userId: req.user._id,
    });
    if (!deletedProblem) {
      return res.status(404).json({ message: 'Problem not found or unauthorized' });
    }
    // Remove the problem from its Topic.
    const updatedTopic = await Topic.findOneAndUpdate(
      { topicId: deletedProblem.topicId, userId: req.user._id },
      { $unset: { [`problems.${deletedProblem.problemId}`]: "" } },
      { new: true }
    );
    // If the topic has no problems left, delete the topic.
    if (updatedTopic && Object.keys(updatedTopic.problems).length === 0) {
      await Topic.findOneAndDelete({ topicId: deletedProblem.topicId, userId: req.user._id });
    }
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------
// Topic Controllers
// ------------------

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user._id });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findOne({ topicId: req.params.topicId, userId: req.user._id });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { topicId, title } = req.body;
    const newTopic = new Topic({
      topicId,
      title,
      userId: req.user._id,
      problems: {},
    });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await Topic.findOneAndUpdate(
      { topicId: req.params.topicId, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedTopic) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }
    res.json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    // Delete all problems associated with this topic for the user.
    await Problem.deleteMany({ topicId: req.params.topicId, userId: req.user._id });
    // Delete the Topic document.
    const deletedTopic = await Topic.findOneAndDelete({
      topicId: req.params.topicId,
      userId: req.user._id,
    });
    if (!deletedTopic) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }
    res.json({ message: 'Topic and its problems deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
