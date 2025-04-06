const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Login post
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.username = user.username;
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Server error' });
  }
});

// Register post
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('register', { error: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Set session
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.username = user.username;
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Server error' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Profile page
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/products');
  }
});

module.exports = router;