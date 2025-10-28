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

const savedSolutionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  solution: solutionSchema,
  originalProblem: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
savedSolutionSchema.index({ userId: 1, createdAt: -1 });
savedSolutionSchema.index({ userId: 1, tags: 1 });
savedSolutionSchema.index({ userId: 1, isFavorite: 1 });

export const SavedSolution = mongoose.model('SavedSolution', savedSolutionSchema);