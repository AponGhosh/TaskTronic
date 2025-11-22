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
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://taskList:task1234@cluster0.r220rbu.mongodb.net/task?retryWrites=true&w=majority&appName=Cluster0';

// Enhanced CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.0.122:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
// Connect with retry and clearer diagnostics
function connectWithRetry(retries = 0) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas connected successfully'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      // Helpful troubleshooting hints
      console.error('Troubleshooting tips:');
      console.error(' - Verify MONGO_URI is correct (no typos)');
      console.error(' - If using mongodb+srv://, ensure SRV DNS resolves:');
      console.error('     nslookup -type=SRV _mongodb._tcp.<your-cluster>.mongodb.net');
      console.error(' - Make sure your IP or 0.0.0.0/0 is added to Atlas Network Access (IP whitelist)');
      console.error(' - If on a corporate/VPN network, try from a different network or use public DNS (e.g. 8.8.8.8)');

      // Retry with exponential backoff (stop after a few attempts)
      if (retries < 5) {
        const delay = Math.min(30000, 2000 * Math.pow(2, retries));
        console.log(`Retrying MongoDB connection in ${delay / 1000}s (attempt ${retries + 1})`);
        setTimeout(() => connectWithRetry(retries + 1), delay);
      } else {
        console.error('Exceeded MongoDB connection retry attempts. Exiting or wait for manual restart.');
      }
    });
}

connectWithRetry();

// Keep logging lower-level connection errors
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
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
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
