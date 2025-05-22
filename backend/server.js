
import express, { json } from 'express';
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
const { connect, connection } = mongoose;

app.use(cors());
app.use(json());

// Replace this with your actual MongoDB Atlas connection string
const MONGO_URI =
  'mongodb+srv://taskList:task1234@cluster0.r220rbu.mongodb.net/task?retryWrites=true&w=majority&appName=Cluster0';

connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

app.get('/getTaskList', (req, res) => {
  find({})
    .then((taskList) => res.json(taskList))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/addTaskList', (req, res) => {
  create({
    task: req.body.task,
    status: req.body.status,
    deadline: req.body.deadline,
  })
    .then((task) => res.json(task))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post('/updateTaskList/:id', (req, res) => {
  const id = req.params.id;
  const updateData = {
    task: req.body.task,
    status: req.body.status,
    deadline: req.body.deadline,
  };
  findByIdAndUpdate(id, updateData, { new: true })
    .then((task) => res.json(task))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.delete('/deleteTaskList/:id', (req, res) => {
  const id = req.params.id;
  findByIdAndDelete({ _id: id })
    .then((task) => res.json(task))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});

/*
import express, { json } from 'express';
import { connect, connection } from 'mongoose';
import cors from 'cors';
import { find, create, findByIdAndUpdate, findByIdAndDelete } from "./models/taskTronic";

var app = express();
app.use(cors());
app.use(json());

// Connect to your MongoDB database (replace with your database URL)
connect("mongodb://127.0.0.1/todo");

// Check for database connection errors
connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

// Get saved tasks from the database
app.get("/getTaskList", (req, res) => {
    find({})
        .then((taskList) => res.json(taskList))
        .catch((err) => res.json(err))
});

// Add new task to the database
app.post("/addTaskList", (req, res) => {
    create({
        task: req.body.task,
        status: req.body.status,
        deadline: req.body.deadline, 
    })
        .then((todo) => res.json(todo))
        .catch((err) => res.json(err));
});

// Update task fields (including deadline)
app.post("/updateTaskList/:id", (req, res) => {
    const id = req.params.id;
    const updateData = {
        task: req.body.task,
        status: req.body.status,
        deadline: req.body.deadline, 
    };
    findByIdAndUpdate(id, updateData)
        .then((todo) => res.json(todo))
        .catch((err) => res.json(err));
});

// Delete task from the database
app.delete("/deleteTaskList/:id", (req, res) => {
    const id = req.params.id;
    findByIdAndDelete({ _id: id })
        .then((todo) => res.json(todo))
        .catch((err) => res.json(err));
});

app.listen(3001, () => {
    console.log('Server running on 3001');
});
*/