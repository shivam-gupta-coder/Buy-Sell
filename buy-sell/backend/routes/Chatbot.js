const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

const genAI = new GoogleGenerativeAI('AIzaSyBestLLXjIXOSukG1L0nnzuIGuiVnxTxPo');
const sessions = []; // Stores all active sessions

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userMessage = req.body.message;

    if (!userMessage?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Find or create session
    let session = sessions.find(s => s.userId === userId);
    if (!session) {
      session = {
        userId,
        history: []
      };
      sessions.push(session);
    }

    // Add user message to history
    session.history.push({ role: 'user', content: userMessage });

    // Generate response using full history
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: session.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: { maxOutputTokens: 1000 }
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const botResponse = response.text();

    // Add bot response to history
    session.history.push({ role: 'model', content: botResponse });

    res.json({
      response: botResponse,
      history: session.history
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

module.exports = router;