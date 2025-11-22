import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  deadline: {
    type: Date
  }
}, { timestamps: true });

// Create and export the model
const Task = mongoose.model('task', taskSchema);

// Export all methods you're using
export const find = (query) => Task.find(query);
export const create = (data) => Task.create(data);
export const findByIdAndUpdate = (id, data, options) => Task.findByIdAndUpdate(id, data, options);
export const findByIdAndDelete = (id) => Task.findByIdAndDelete(id);
