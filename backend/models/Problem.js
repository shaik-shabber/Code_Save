const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    statement: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    constraints: { type: String },
    explanation: { type: String },
    code: { type: String },
    language: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'other'], required: true },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    isFavorite: { type: Boolean, default: false },
    isSavedForLater: { type: Boolean, default: false },
    isSolved: { type: Boolean, default: false },
    topicId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Problem', ProblemSchema);
