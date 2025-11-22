import axios from "axios";
import React, { useEffect, useState } from "react";

function Task() {
    const [taskList, setTaskList] = useState([]);
    const [editableId, setEditableId] = useState(null);
    const [editedTask, setEditedTask] = useState("");
    const [editedStatus, setEditedStatus] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [newDeadline, setNewDeadline] = useState("");
    const [editedDeadline, setEditedDeadline] = useState("");

    // Fetch tasks from database
    useEffect(() => {
        axios.get('http://localhost:3001/api/tasks')
            .then(result => {
                setTaskList(result.data)
            })
            .catch(err => console.log(err))
    }, [])

    // Function to toggle the editable state for a specific row
    const toggleEditable = (id) => {
        const rowData = taskList.find((data) => data._id === id);
        if (rowData) {
            setEditableId(id);
            setEditedTask(rowData.task);
            setEditedStatus(rowData.status);
            setEditedDeadline(rowData.deadline ? formatDateForInput(rowData.deadline) : "");
        } else {
            setEditableId(null);
            setEditedTask("");
            setEditedStatus("");
            setEditedDeadline("");
        }
    };

    // Format date for datetime-local input
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Function to add task to the database
    const addTask = (e) => {
        e.preventDefault();
        if (!newTask || !newStatus || !newDeadline) {
            alert("All fields must be filled out.");
            return;
        }

        axios.post('http://localhost:3001/api/tasks', { 
            task: newTask, 
            status: newStatus, 
            deadline: newDeadline 
        })
        .then(res => {
            setNewTask("");
            setNewStatus("");
            setNewDeadline("");
            return axios.get('http://localhost:3001/api/tasks');
        })
        .then(res => {
            setTaskList(res.data);
        })
        .catch(err => console.log(err));
    }

    // Function to save edited data to the database
    const saveEditedTask = (id) => {
        const editedData = {
            task: editedTask,
            status: editedStatus,
            deadline: editedDeadline,
        };

        if (!editedTask || !editedStatus || !editedDeadline) {
            alert("All fields must be filled out.");
            return;
        }

        axios.put(`http://localhost:3001/api/tasks/${id}`, editedData)
            .then(result => {
                return axios.get('http://localhost:3001/api/tasks');
            })
            .then(res => {
                setTaskList(res.data);
                setEditableId(null);
                setEditedTask("");
                setEditedStatus("");
                setEditedDeadline("");
            })
            .catch(err => console.log(err));
    }

    // Delete task from database
    const deleteTask = (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            axios.delete(`http://localhost:3001/api/tasks/${id}`)
                .then(result => {
                    return axios.get('http://localhost:3001/api/tasks');
                })
                .then(res => {
                    setTaskList(res.data);
                })
                .catch(err => console.log(err));
        }
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-7">
                    <h2 className="text-center">Task List</h2>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-primary">
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Deadline</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(taskList) && taskList.map((data) => (
                                    <tr key={data._id}>
                                        <td>
                                            {editableId === data._id ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={editedTask}
                                                    onChange={(e) => setEditedTask(e.target.value)}
                                                />
                                            ) : (
                                                data.task
                                            )}
                                        </td>
                                        <td>
                                            {editableId === data._id ? (
                                                <select
                                                    className="form-control"
                                                    value={editedStatus}
                                                    onChange={(e) => setEditedStatus(e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            ) : (
                                                data.status
                                            )}
                                        </td>
                                        <td>
                                            {editableId === data._id ? (
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={editedDeadline}
                                                    onChange={(e) => setEditedDeadline(e.target.value)}
                                                />
                                            ) : (
                                                formatDate(data.deadline)
                                            )}
                                        </td>
                                        <td>
                                            {editableId === data._id ? (
                                                <>
                                                    <button 
                                                        className="btn btn-success btn-sm me-2" 
                                                        onClick={() => saveEditedTask(data._id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        onClick={() => toggleEditable(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="btn btn-primary btn-sm me-2" 
                                                        onClick={() => toggleEditable(data._id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        onClick={() => deleteTask(data._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-md-5">
                    <h2 className="text-center">Add New Task</h2>
                    <form className="bg-light p-4 rounded">
                        <div className="mb-3">
                            <label className="form-label">Task Description</label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Enter task description"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Status</label>
                            <select
                                className="form-control"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                required
                            >
                                <option value="">Select status</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Deadline</label>
                            <input
                                className="form-control"
                                type="datetime-local"
                                value={newDeadline}
                                onChange={(e) => setNewDeadline(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            onClick={addTask} 
                            className="btn btn-success w-100"
                        >
                            Add Task
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Task;

