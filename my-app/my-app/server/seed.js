import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery_homework';

const seedProducts = [
  // Fruits
  { name: 'Red Apple', price: 40, image: '🍎', category: 'Fruits', stock: 50, description: 'Fresh red apples' },
  { name: 'Banana Bunch', price: 30, image: '🍌', category: 'Fruits', stock: 100, description: 'Ripe yellow bananas' },
  { name: 'Orange', price: 35, image: '🍊', category: 'Fruits', stock: 80, description: 'Juicy oranges' },
  // Vegetables
  { name: 'Tomatoes', price: 49, image: '🍅', category: 'Vegetables', stock: 70, description: 'Fresh tomatoes' },
  { name: 'Spinach Pack', price: 20, image: '🥬', category: 'Vegetables', stock: 70, description: 'Fresh organic spinach' },
  { name: 'Carrot kg', price: 35, image: '🥕', category: 'Vegetables', stock: 80, description: 'Fresh carrots per kg' },
  // Dairy
  { name: 'Milk 1L', price: 65, image: '🥛', category: 'Dairy', stock: 200, description: 'Fresh full-cream milk' },
  { name: 'Paneer 200g', price: 120, image: '🧀', category: 'Dairy', stock: 40, description: 'Fresh cottage cheese' },
  // Electronics
  { name: 'USB Cable', price: 299, image: '📱', category: 'Electronics', stock: 50, description: 'Type-C USB cable' },
  { name: 'Earphones', price: 499, image: '🎧', category: 'Electronics', stock: 30, description: 'Wired earphones' },
  // Clothes
  { name: 'T-Shirt', price: 399, image: '👕', category: 'Clothes', stock: 100, description: 'Cotton T-shirt' },
  { name: 'Jeans', price: 999, image: '👖', category: 'Clothes', stock: 50, description: 'Denim jeans' },
  // Snacks
  { name: 'Chips Pack', price: 20, image: '🍿', category: 'Snacks', stock: 200, description: 'Potato chips' },
  { name: 'Cookies', price: 50, image: '🍪', category: 'Snacks', stock: 150, description: 'Chocolate cookies' },
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB — seeding...');
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log(`Seed complete: ${seedProducts.length} products added`);
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

