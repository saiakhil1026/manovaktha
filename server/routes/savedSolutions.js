import express from 'express';
import { SavedSolution } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

import { Router } from 'express';
const router = Router();

// Get user's saved solutions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, isFavorite } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (isFavorite !== undefined) {
      query.isFavorite = isFavorite === 'true';
    }

    const savedSolutions = await SavedSolution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SavedSolution.countDocuments(query);

    res.json({
      savedSolutions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get saved solutions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a solution
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { solution, originalProblem, notes = '', tags = [] } = req.body;

    if (!solution || !originalProblem) {
      return res.status(400).json({ error: 'Solution and original problem are required' });
    }

    // Check if solution is already saved
    const existingSolution = await SavedSolution.findOne({
      userId: req.user._id,
      'solution.title': solution.title,
      'solution.reference': solution.reference
    });

    if (existingSolution) {
      return res.status(400).json({ error: 'Solution is already saved' });
    }

    const savedSolution = new SavedSolution({
      userId: req.user._id,
      solution,
      originalProblem,
      notes,
      tags
    });

    await savedSolution.save();

    res.status(201).json({ 
      message: 'Solution saved successfully',
      savedSolution 
    });
  } catch (error) {
    console.error('Save solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific saved solution
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const savedSolution = await SavedSolution.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedSolution) {
      return res.status(404).json({ error: 'Saved solution not found' });
    }

    res.json({ savedSolution });
  } catch (error) {
    console.error('Get saved solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update saved solution
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { notes, tags, isFavorite } = req.body;
    
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const savedSolution = await SavedSolution.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!savedSolution) {
      return res.status(404).json({ error: 'Saved solution not found' });
    }

    res.json({ 
      message: 'Saved solution updated successfully',
      savedSolution 
    });
  } catch (error) {
    console.error('Update saved solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete saved solution
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const savedSolution = await SavedSolution.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedSolution) {
      return res.status(404).json({ error: 'Saved solution not found' });
    }

    res.json({ message: 'Saved solution deleted successfully' });
  } catch (error) {
    console.error('Delete saved solution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const savedSolution = await SavedSolution.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedSolution) {
      return res.status(404).json({ error: 'Saved solution not found' });
    }

    savedSolution.isFavorite = !savedSolution.isFavorite;
    await savedSolution.save();

    res.json({ 
      message: 'Favorite status updated successfully',
      savedSolution 
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;