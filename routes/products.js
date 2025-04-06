const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/products');
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { 
      products, 
      user: req.session.userId ? { 
        id: req.session.userId,
        username: req.session.username,
        isAdmin: req.session.isAdmin
      } : null 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('product-detail', { 
      product,
      user: req.session.userId ? { 
        id: req.session.userId,
        username: req.session.username,
        isAdmin: req.session.isAdmin
      } : null 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Admin routes
// Add product page
router.get('/admin/add', isAdmin, (req, res) => {
  res.render('admin/add-product');
});

// Add product post
router.post('/admin/add', isAdmin, async (req, res) => {
  try {
    const { name, brand, description, price, image, inStock, category, features } = req.body;
    
    const product = new Product({
      name,
      brand,
      description,
      price: Number(price),
      image,
      inStock: Number(inStock),
      category,
      features: features.split(',').map(feat => feat.trim())
    });
    
    await product.save();
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Edit product page
router.get('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('admin/edit-product', { product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update product
router.post('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const { name, brand, description, price, image, inStock, category, features } = req.body;
    
    await Product.findByIdAndUpdate(req.params.id, {
      name,
      brand,
      description,
      price: Number(price),
      image,
      inStock: Number(inStock),
      category,
      features: features.split(',').map(feat => feat.trim())
    });
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete product
router.post('/admin/delete/:id', isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;