const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Get cart
router.get('/', isAuthenticated, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
    
    if (!cart) {
      cart = { items: [] };
    }
    
    res.render('cart', { 
      cart,
      user: {
        id: req.session.userId,
        username: req.session.username,
        isAdmin: req.session.isAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Add to cart
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Find user's cart
    let cart = await Cart.findOne({ user: req.session.userId });
    
    // Create cart if not exists
    if (!cart) {
      cart = new Cart({ user: req.session.userId, items: [] });
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: Number(quantity)
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update cart item
router.post('/update/:itemId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.session.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    if (Number(quantity) <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = Number(quantity);
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Remove from cart
router.post('/remove/:itemId', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Remove item
    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Checkout
router.get('/checkout', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.redirect('/cart');
    }
    
    res.render('checkout', { 
      cart,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;