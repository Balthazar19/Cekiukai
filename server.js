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

// Enforce JSON Content-Type middleware
app.use((req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ error: 'Invalid content type. Only JSON is accepted.' });
    }
    next();
});

// Performance logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} took ${duration} ms`);
        if (duration > 3000) {
            console.warn(`⚠️ Slow request: ${req.method} ${req.url} took ${duration} ms`);
        }
    });
    next();
});

// API routes
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
app.post('/api/tempCreateCheck', async (req, res) => {
    try {
        // Paimame vartotojo username ir userId iš užklausos
        const { username, userId } = req.body;

        // Patikriname, ar vartotojas egzistuoja pagal userId
        const user = await prisma.user.findFirst({
            where: { id: userId }
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Sukuriame prekes su kategorijomis
        const products = [
            { name: "Milk", price: 2.50, category: "Dairy" },
            { name: "Bread", price: 1.50, category: "Bakery" },
            { name: "Cheese", price: 5.00, category: "Dairy" }
        ];

        // Apskaičiuojame bendrą kainą
        const totalPrice = products.reduce((sum, product) => sum + product.price, 0);

        // Sukuriame naują "check" įrašą su prekėmis
        const newCheck = await prisma.check.create({
            data: {
                userId: user.id,  // Susiejame su vartotojo ID
                products: products,  // Prekės bus JSON duomenys
                totalPrice: totalPrice,
                createdAt: new Date(),
            },
        });

        // Grąžiname atsakymą su pranešimu apie sėkmingą prekių sukūrimą
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
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid username or password!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid username or password!" });
        }

        res.json({ success: true, message: "Login successful!", userId: user.id, username: user.username});
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (password.length < 12) {
        return res.status(400).json({ message: "Password must be at least 12 characters long." });
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            username: username
        }
    });

    if (existingUser) {
        return res.status(400).json({ message: "Username is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            }
        });
        res.json({ success: true, ok: true });
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];  // Paimame tokeną iš Authorization header

        if (!token) {
            return res.status(401).json({ error: "Neprisijungęs vartotojas" });
        }

        // Patikriname tokeną
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Randame vartotoją pagal userId
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "Vartotojas nerastas" });
        }

        // Grąžiname vartotojo vardą
        res.json({ name: user.username });

    } catch (error) {
        console.error("Klaida gaunant vartotojo duomenis:", error);
        res.status(500).json({ error: "Serverio klaida" });
    }
});
app.get("/api/checks", async (req, res) => {
    const username = req.query.username;
    console.log(username);

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const checks = await prisma.check.findMany({
            where: {
                userId: user.id
            }
        });

        res.json(checks);
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

export default app;
