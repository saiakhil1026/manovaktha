import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true
  }
});

const manuscriptHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  solutions: [solutionSchema],
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
manuscriptHistorySchema.index({ userId: 1, createdAt: -1 });
manuscriptHistorySchema.index({ userId: 1, tags: 1 });

export const ManuscriptHistory = mongoose.model('ManuscriptHistory', manuscriptHistorySchema);