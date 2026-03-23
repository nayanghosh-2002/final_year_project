const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  mood: { 
    type: Number, 
    required: true 
  },
  reflection: { 
    type: String,
    default: ''
  },
  date: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

// This specific line is what prevents the "Entry.find is not a function" error
module.exports = mongoose.model('Entry', entrySchema);