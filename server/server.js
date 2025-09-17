import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Ta asynchroniczna funkcja najpierw łączy się z bazą danych,
// a dopiero potem uruchamia serwer.
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Połączono z bazą danych!');

        // Trasy (routes) API
        app.get('/api/users', async (req, res) => {
            const users = await User.find({});
            res.status(200).json(users);
        });

        app.post('/api/register', async (req, res) => {
            // Logika rejestracji
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Please enter all fields' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({
                username,
                email,
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            res.status(201).json({ message: 'User registered successfully' });
        });

        app.post('/api/login', async (req, res) => {
            // Logika logowania
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Please enter all fields' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: 'User does not exist' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token, user: { id: user._id, username: user.username } });
        });

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));

    } catch (e) {
        // Jeśli połączenie z bazą danych nie powiedzie się,
        // zostanie zgłoszony błąd i proces się zakończy.
        console.error('Błąd połączenia z bazą danych:', e);
        process.exit(1);
    }
};

startServer();