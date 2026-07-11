// 1. Load environment variables
require('dotenv').config();

// 2. Import packages
const express = require('express');
const cors = require('cors');

// 3. Import database
const db = require('./utils/db');

// 4. Import routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);

// Test Route
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is working perfectly!'
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ Database connected! Server time:', result.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
});

// Error Handlers
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});