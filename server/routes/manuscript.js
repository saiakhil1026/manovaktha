import express from 'express';
import { ManuscriptHistory } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

import { Router } from 'express';
const router = Router();

// Get user's manuscript history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, tags } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      userId: req.user._id,
      isArchived: false
    };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const history = await ManuscriptHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ManuscriptHistory.countDocuments(query);

    res.json({
      history,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get manuscript history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new manuscript history entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { problem, solutions, language, tags = [] } = req.body;

    if (!problem || !solutions || !Array.isArray(solutions)) {
      return res.status(400).json({ error: 'Problem and solutions are required' });
    }

    const historyEntry = new ManuscriptHistory({
      userId: req.user._id,
      problem,
      solutions,
      language: language || req.user.preferences.language,
      tags
    });

    await historyEntry.save();

    res.status(201).json({ 
      message: 'Manuscript history saved successfully',
      entry: historyEntry 
    });
  } catch (error) {
    console.error('Save manuscript history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific manuscript entry
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await ManuscriptHistory.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ error: 'Manuscript entry not found' });
    }

    res.json({ entry });
  } catch (error) {
    console.error('Get manuscript entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete manuscript history entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const entry = await ManuscriptHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ error: 'Manuscript entry not found' });
    }

    res.json({ message: 'Manuscript entry deleted successfully' });
  } catch (error) {
    console.error('Delete manuscript entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive manuscript history entry
router.put('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const entry = await ManuscriptHistory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isArchived: true } },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Manuscript entry not found' });
    }

    res.json({ message: 'Manuscript entry archived successfully', entry });
  } catch (error) {
    console.error('Archive manuscript entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all manuscript history
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await ManuscriptHistory.deleteMany({ userId: req.user._id });
    
    res.json({ 
      message: 'All manuscript history cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Clear manuscript history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;