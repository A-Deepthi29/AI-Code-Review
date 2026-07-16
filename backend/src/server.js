require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./utils/db");

const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/review");

const app = express();   // ✅ ONLY ONCE

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/test", (req, res) => {
    res.json({ message: "Backend is working!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
        await db.query("SELECT NOW()");
        console.log("✅ Database connected!");
    } catch (err) {
        console.error(err);
    }
});