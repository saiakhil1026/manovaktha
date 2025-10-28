import express from 'express';
import { JourneyPlan } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

import { Router } from 'express';
const router = Router();

// Get user's journey plans
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const journeyPlans = await JourneyPlan.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JourneyPlan.countDocuments(query);

    res.json({
      journeyPlans,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get journey plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current active journey
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const currentJourney = await JourneyPlan.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ updatedAt: -1 });

    res.json({ journeyPlan: currentJourney });
  } catch (error) {
    console.error('Get current journey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new journey plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, originalProblem, days, language } = req.body;

    if (!title || !originalProblem || !days || !Array.isArray(days)) {
      return res.status(400).json({ error: 'Title, original problem, and days array are required' });
    }

    // Mark any existing active journey as paused
    await JourneyPlan.updateMany(
      { userId: req.user._id, status: 'active' },
      { $set: { status: 'paused' } }
    );

    const journeyPlan = new JourneyPlan({
      userId: req.user._id,
      title,
      originalProblem,
      days: days.map(day => ({ ...day, completed: false })),
      language: language || req.user.preferences.language
    });

    await journeyPlan.save();

    res.status(201).json({ 
      message: 'Journey plan created successfully',
      journeyPlan 
    });
  } catch (error) {
    console.error('Create journey plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific journey plan
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const journeyPlan = await JourneyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journeyPlan) {
      return res.status(404).json({ error: 'Journey plan not found' });
    }

    res.json({ journeyPlan });
  } catch (error) {
    console.error('Get journey plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update journey plan status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'paused', 'completed', 'abandoned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const journeyPlan = await JourneyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!journeyPlan) {
      return res.status(404).json({ error: 'Journey plan not found' });
    }

    res.json({ 
      message: 'Journey plan status updated successfully',
      journeyPlan 
    });
  } catch (error) {
    console.error('Update journey status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a day as completed
router.patch('/:id/days/:dayNumber/complete', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const dayNumber = parseInt(req.params.dayNumber);

    const journeyPlan = await JourneyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journeyPlan) {
      return res.status(404).json({ error: 'Journey plan not found' });
    }

    const dayIndex = journeyPlan.days.findIndex(day => day.day === dayNumber);
    if (dayIndex === -1) {
      return res.status(404).json({ error: 'Day not found' });
    }

    journeyPlan.days[dayIndex].completed = true;
    journeyPlan.days[dayIndex].completedAt = new Date();
    if (notes) {
      journeyPlan.days[dayIndex].notes = notes;
    }

    await journeyPlan.save();

    res.json({ 
      message: 'Day marked as completed successfully',
      journeyPlan 
    });
  } catch (error) {
    console.error('Mark day complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add notes to a day
router.patch('/:id/days/:dayNumber/notes', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const dayNumber = parseInt(req.params.dayNumber);

    const journeyPlan = await JourneyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journeyPlan) {
      return res.status(404).json({ error: 'Journey plan not found' });
    }

    const dayIndex = journeyPlan.days.findIndex(day => day.day === dayNumber);
    if (dayIndex === -1) {
      return res.status(404).json({ error: 'Day not found' });
    }

    journeyPlan.days[dayIndex].notes = notes || '';
    await journeyPlan.save();

    res.json({ 
      message: 'Day notes updated successfully',
      journeyPlan 
    });
  } catch (error) {
    console.error('Update day notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete journey plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const journeyPlan = await JourneyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!journeyPlan) {
      return res.status(404).json({ error: 'Journey plan not found' });
    }

    res.json({ message: 'Journey plan deleted successfully' });
  } catch (error) {
    console.error('Delete journey plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;