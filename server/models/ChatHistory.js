import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['quickChat', 'analysis', 'journeySession'],
    required: true
  },
  title: {
    type: String,
    default: 'Chat Session'
  },
  messages: [chatMessageSchema],
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    required: true
  },
  metadata: {
    // For journey sessions
    journeyPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JourneyPlan'
    },
    dayNumber: Number,
    topic: String,
    
    // For analysis sessions
    analysisType: String,
    symptoms: [String],
    
    // General metadata
    tags: [String],
    originalProblem: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity on message addition
chatSessionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastActivity = new Date();
  }
  next();
});

// Index for efficient queries
chatSessionSchema.index({ userId: 1, sessionType: 1, lastActivity: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);