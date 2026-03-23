const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto'); // <-- Import crypto functions

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.use(protect);

// GET /api/chat - Fetch user's chat history (Decrypted)
router.get('/', async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      return res.json([]);
    }

    // Decrypt the history before sending to the frontend
    const decryptedMessages = chat.messages.map(msg => ({
      _id: msg._id,
      role: msg.role,
      timestamp: msg.timestamp,
      parts: msg.parts.map(p => ({ 
        text: decrypt(p.text) // <-- Decrypting here
      }))
    }));

    res.json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/chat - Send message to Gemini and Encrypt for DB
router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    let chat = await Chat.findOne({ user: req.user._id });
    if (!chat) {
      chat = new Chat({ user: req.user._id, messages: [] });
    }

    // 1. Decrypt history to send to Gemini (AI needs to read plaintext)
    const history = chat.messages.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(p => ({ 
        text: decrypt(p.text) // <-- Decrypting here
      }))
    }));

    const systemInstruction = `You are a highly empathetic, supportive, and judgment-free mental wellness companion inside the MindTracker app. 
    Your goal is to listen to the user, validate their feelings, and offer gentle, encouraging responses. 
    Do not act like a doctor or give medical advice. Keep your responses conversational, warm, and relatively concise.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction 
    });

    const chatSession = model.startChat({ history: history });

    // 2. Send the plaintext message to Gemini
    const result = await chatSession.sendMessage(message);
    const aiResponseText = result.response.text();

    // 3. ENCRYPT the messages before saving them to MongoDB
    chat.messages.push({ 
      role: 'user', 
      parts: [{ text: encrypt(message) }] // <-- Encrypting here
    });
    chat.messages.push({ 
      role: 'model', 
      parts: [{ text: encrypt(aiResponseText) }] // <-- Encrypting here
    });
    
    await chat.save();

    // 4. Send plaintext back to the user's screen
    res.json({ text: aiResponseText });

  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ message: 'Failed to communicate with AI Companion' });
  }
});

module.exports = router;