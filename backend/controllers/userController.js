const User = require('../models/User');
const Problem = require('../models/Problem');

exports.getProfile = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: 'User not authenticated' });
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(problemId)) {
      user.favorites.push(problemId);
      await user.save();
    }
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isFavorite: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id !== problemId);
    await user.save();
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isFavorite: false },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSavedForLater = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.savedForLater.includes(problemId)) {
      user.savedForLater.push(problemId);
      await user.save();
    }
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isSavedForLater: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeSavedForLater = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    user.savedForLater = user.savedForLater.filter(id => id !== problemId);
    await user.save();
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isSavedForLater: false },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markSolved = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.solvedProblems.includes(problemId)) {
      user.solvedProblems.push(problemId);
      await user.save();
    }
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isSolved: true },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unmarkSolved = async (req, res) => {
  try {
    const { problemId } = req.body;
    const user = await User.findById(req.user._id);
    user.solvedProblems = user.solvedProblems.filter(id => id !== problemId);
    await user.save();
    await Problem.findOneAndUpdate(
      { problemId, userId: req.user._id },
      { isSolved: false },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
