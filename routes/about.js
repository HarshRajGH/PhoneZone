// routes/about.js

const express = require('express');
const router = express.Router();

// About page route
router.get('/', (req, res) => {
  res.render('about', { 
    title: 'About Us - PhoneZone',
    user: req.user // Assuming you have user authentication
  });
});

module.exports = router;