import express from 'express';
import { ChatSession } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

import { Router } from 'express';
const router = Router();

// Get user's chat sessions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { sessionType, page = 1, limit = 10, isActive = true } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      userId: req.user._id,
      isActive: isActive === 'true'
    };

    if (sessionType) {
      query.sessionType = sessionType;
    }

    const chatSessions = await ChatSession.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('metadata.journeyPlanId', 'title');

    const total = await ChatSession.countDocuments(query);

    res.json({
      chatSessions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: total
      }
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { sessionType, title, language, metadata = {} } = req.body;

    if (!sessionType || !['quickChat', 'analysis', 'journeySession'].includes(sessionType)) {
      return res.status(400).json({ error: 'Valid session type is required' });
    }

    const chatSession = new ChatSession({
      userId: req.user._id,
      sessionType,
      title: title || `${sessionType} Session`,
      language: language || req.user.preferences.language,
      metadata,
      messages: []
    });

    await chatSession.save();

    res.status(201).json({ 
      message: 'Chat session created successfully',
      chatSession 
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific chat session
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('metadata.journeyPlanId', 'title');

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ chatSession });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add message to chat session
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { role, content } = req.body;

    if (!role || !content || !['user', 'model'].includes(role)) {
      return res.status(400).json({ error: 'Valid role and content are required' });
    }

    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    chatSession.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    await chatSession.save();

    res.json({ 
      message: 'Message added successfully',
      chatSession 
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chat session
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, metadata, isActive } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (metadata !== undefined) updateData.metadata = { ...updateData.metadata, ...metadata };
    if (isActive !== undefined) updateData.isActive = isActive;

    const chatSession = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ 
      message: 'Chat session updated successfully',
      chatSession 
    });
  } catch (error) {
    console.error('Update chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chat session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const chatSession = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive chat session
router.patch('/:id/archive', authenticateToken, async (req, res) => {
  try {
    const chatSession = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!chatSession) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ 
      message: 'Chat session archived successfully',
      chatSession 
    });
  } catch (error) {
    console.error('Archive chat session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;