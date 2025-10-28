import mongoose from 'mongoose';

const journeyDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
});

const journeyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalProblem: {
    type: String,
    required: true
  },
  days: [journeyDaySchema],
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate progress before saving
journeyPlanSchema.pre('save', function(next) {
  if (this.days && this.days.length > 0) {
    const completedDays = this.days.filter(day => day.completed).length;
    this.progress = Math.round((completedDays / this.days.length) * 100);
    
    if (this.progress === 100 && this.status === 'active') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  next();
});

// Index for efficient queries
journeyPlanSchema.index({ userId: 1, status: 1 });
journeyPlanSchema.index({ userId: 1, createdAt: -1 });

export const JourneyPlan = mongoose.model('JourneyPlan', journeyPlanSchema);