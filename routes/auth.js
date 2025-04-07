const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

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

// Reset password page
router.get('/reset-password', (req, res) => {
  res.render('reset', { error: null, success: null });
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.username = user.username;

    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Server error' });
  }
});

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('register', { error: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.username = user.username;

    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.render('register', { error: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render('reset', { error: 'Passwords do not match.', success: null });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('reset', { error: 'No account found with this email.', success: null });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password directly in DB to avoid double hashing
    await User.updateOne({ email }, { password: hashedPassword });

    return res.render('reset', { error: null, success: 'Password has been successfully updated.' });
  } catch (err) {
    console.error(err);
    return res.render('reset', { error: 'Something went wrong. Please try again later.', success: null });
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
