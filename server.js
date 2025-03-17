import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

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

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

export default app;
