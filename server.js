import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.post('/api/createCheck', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            return res.status(400).json({ error: "No users found in the database" });
        }
        const userId = user.id;

        const products = [
            { name: "Milk", price: 2.50 },
            { name: "Bread", price: 1.50 },
            { name: "Cheese", price: 5.00 }
        ];
        const totalPrice = 9.00;

        const newCheck = await prisma.check.create({
            data: {
                userId,
                products,
                totalPrice,
                createdAt: new Date(),
            },
        });

        res.json({ message: "✅ Dummy check saved successfully!", newCheck });
    } catch (error) {
        console.error("❌ Error saving dummy check:", error);
        res.status(500).json({ error: "Failed to save check" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findFirst({
            where: { username, password },
        });

        if (user) {
            res.json({ success: true, message: "Login successful!" });
        } else {
            res.status(401).json({ success: false, message: "Invalid username or password!" });
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    // Validate username and password
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if password is at least 12 characters long
    if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long." });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            username: username
        }
    });

    if (existingUser) {
        return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 salt rounds

    try {
        // Create a new user and save to the database
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword, // Save hashed password
            }
        });
        res.json({success:true, ok:true});
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

export default app;
