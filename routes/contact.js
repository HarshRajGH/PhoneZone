// routes/contact.js

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Contact page route
router.get('/', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us - PhoneZone',
    user: req.user // Assuming you have user authentication
  });
});

// Handle contact form submission
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // For demonstration purposes only - in production, use real email credentials
    // If you don't want to set up nodemailer, you can comment out this part
    // and just use the success message below
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'harshlpu28@gmail.com',
          pass: 'eghikyolbrblklzp'
        },
        tls: {
            rejectUnauthorized: false  // ✅ Add this line
          }
      });
    
    // Send email
    await transporter.sendMail({
      from: '"PhoneZone" <harshlpu28@gmail.com>',
      to: 'harshlpu28@gmail.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    
    
    // Simulate successful form submission
    console.log('Contact form submission:', { name, email, subject });
    
    // Return success message
    res.render('contact', {
      title: 'Contact Us - PhoneZone',
      user: req.user,
      message: 'Your message has been sent! We will get back to you soon.',
      messageType: 'success'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    
    res.render('contact', {
      title: 'Contact Us - PhoneZone',
      user: req.user,
      message: 'There was an error sending your message. Please try again later.',
      messageType: 'error'
    });
  }
});

module.exports = router;