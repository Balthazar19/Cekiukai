import express from 'express';
import cors from 'cors';
import dbServer from './db.server.js';
import dotenv from 'dotenv';


const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.post('/api/createCheck', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const newCheck = await dbServer.check.create({
            data: { text, createdAt: new Date() },
        });

        res.json({ message: "Check saved successfully!", newCheck });
    } catch (error) {
        console.error("Error saving check:", error);
        res.status(500).json({ error: "Failed to save check" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
