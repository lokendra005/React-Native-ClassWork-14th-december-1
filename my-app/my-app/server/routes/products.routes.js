import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products - list all products (optionally filter by ?q= or ?category=)
router.get('/', async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    const products = await Product.find(filter).limit(100);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/products/:id - get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/products - create a product
router.post('/', async (req, res) => {
  try {
    const { name, price, imageUrl, image, category, description, stock } = req.body;
    const product = new Product({ name, price, imageUrl, image, category, description, stock });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Bad request', details: err.message });
  }
});

export default router;

