// 1. Load environment variables FIRST
require('dotenv').config(); 

// 2. Load external frameworks next
const express = require('express');
const cors = require('cors');

// 3. Load database module AFTER environment variables are ready
const db = require('./utils/db'); 

const app = express();
app.use(cors());
app.use(express.json());

// Add this import near the top with your other imports
const authRoutes = require('./routes/auth');
// Add this line right below your app.use(express.json()) line:
app.use('/api/auth', authRoutes);
const reviewRoutes = require('./routes/review');

// Add this right below your app.use('/api/auth', authRoutes) line:
app.use('/api/reviews', reviewRoutes);

// Simple Test Route
app.get('/test', (req, res) => {
    res.json({ message: "Backend is working perfectly!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Test your database connection immediately on start
    try {
        const res = await db.query('SELECT NOW()');
        console.log('✅ Database connected! Server time:', res.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
});