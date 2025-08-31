// server/src/index.ts
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

app.use(cors({
  origin: 'http://localhost:5173', // My Vite dev server port
  credentials: true
}));

// --- Database Connection ---
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the environment variables.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err: any) {
    console.error(`MongoDB connection error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});


// --- Start Server ---
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});