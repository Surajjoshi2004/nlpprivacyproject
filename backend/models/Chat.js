const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true
  },
  anonymizedText: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['tags', 'hash', 'surrogate', 'pseudonyms'],  // Add 'pseudonyms' here
    required: true
  },
  entities: {
    type: Array,
    default: []
  },
  originalSentiment: {
    type: Object,
    default: {}
  },
  anonymizedSentiment: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
