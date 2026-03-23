const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// This path MUST match the name of the file we just created
const { protect } = require('../middleware/auth');

// Protect all entry routes
router.use(protect);

// GET /api/entries - Get all entries for the logged-in user
router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user._id }).sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/entries - Create a new entry
router.post('/', async (req, res) => {
  const { mood, reflection, date } = req.body;
  try {
    const entry = await Entry.create({
      user: req.user._id,
      mood,
      reflection,
      date: date || Date.now()
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/entries/:id - Update an entry
router.put('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    
    // Ensure the entry belongs to the user
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    entry.mood = req.body.mood || entry.mood;
    entry.reflection = req.body.reflection !== undefined ? req.body.reflection : entry.reflection;
    
    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/entries/:id - Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    
    // Ensure the entry belongs to the user
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await entry.deleteOne();
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;