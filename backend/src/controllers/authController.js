const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

// 1. REGISTER USER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const userExist = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Save to DB
        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, passwordHash]
        );

        res.status(201).json({ message: "User registered!", user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = userRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};