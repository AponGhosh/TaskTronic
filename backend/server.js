import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  find,
  create,
  findByIdAndUpdate,
  findByIdAndDelete,
} from './models/taskTronic.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS Configuration - allow only configured frontend origin
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
// Connect with retry and clearer diagnostics
function connectWithRetry(retries = 0) {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not set. Set the environment variable MONGO_URI to your MongoDB Atlas connection string.');
    return;
  }

  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas connected successfully'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.error(' - Verify MONGO_URI is correct and contains username/password (if required)');
      console.error(' - Ensure your Atlas cluster allows connections from your app (Network Access)');

      if (retries < 5) {
        const delay = Math.min(30000, 2000 * Math.pow(2, retries));
        console.log(`Retrying MongoDB connection in ${delay / 1000}s (attempt ${retries + 1})`);
        setTimeout(() => connectWithRetry(retries + 1), delay);
      } else {
        console.error('Exceeded MongoDB connection retry attempts.');
      }
    });
}

connectWithRetry();

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error (event):', err);
});

// API Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await find({});
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { task, status, deadline } = req.body;
    if (!task || !status) {
      return res.status(400).json({ error: 'Task and status are required' });
    }
    const newTask = await create({ task, status, deadline });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, status, deadline } = req.body;
    
    if (!task || !status) {
      return res.status(400).json({ error: 'Task and status are required' });
    }

    const updatedTask = await findByIdAndUpdate(
      id, 
      { task, status, deadline }, 
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await findByIdAndDelete(id);
    
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health Check Endpoint
// Health route: required response { ok: true }
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Optional detailed health endpoint for debugging
app.get('/api/healthz', (req, res) => {
  res.json({
    ok: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    frontend: FRONTEND_URL,
    timestamp: new Date().toISOString()
  });
});

// Root route - provides a quick human-readable landing page and link to health
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>TaskTronic API</title></head>
      <body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;">
        <h1>TaskTronic API</h1>
        <p>Backend is running. Use the health endpoint to verify status:</p>
        <ul>
          <li><a href="/api/health">/api/health</a> (simple)</li>
          <li><a href="/api/healthz">/api/healthz</a> (detailed)</li>
        </ul>
      </body>
    </html>
  `);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
