const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  // Gemini expects history in a specific 'role' and 'parts' format
  messages: [{
    role: { 
      type: String, 
      enum: ['user', 'model'], 
      required: true 
    },
    parts: [{ 
      text: { type: String, required: true } 
    }],
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);