const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problems: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', TopicSchema);
