const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timezone: { type: String, default: 'UTC' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving to database
// Hash password before saving to database
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return; // Just return to exit early
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No need to call next() at the end! Mongoose knows when the async function finishes.
});

// Method to check password on login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);