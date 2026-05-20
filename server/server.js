import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import commentRoutes from './routes/comments.js';
import invitationRoutes from './routes/invitations.js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, same-origin in production)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      callback(null, true); // Allow all in case of Railway auto-generated domains
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/invitations', invitationRoutes);

// Error handler for API routes
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    env: process.env.NODE_ENV || 'development',
  });
});

// Serve static assets if client build exists
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  console.log(`Serving static files from: ${clientDist}`);
  app.use(express.static(clientDist));

  // SPA fallback — serve index.html for any non-API route
  app.get('*any', (req, res) => {
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
} else {
  console.warn(`WARNING: Client build directory not found at ${clientDist}.`);
  console.warn('The frontend static files will not be served.');
}

// Start server first (so Railway/Render detects the port), then connect to DB
const startServer = async () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    console.error('Server is running but database is unavailable. API requests will fail.');
  }
};

startServer();
