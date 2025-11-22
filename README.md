# TaskTronic

TaskTronic is a simple full-stack task management application (To‑Do list) with a React frontend and a Node.js + Express backend using MongoDB for persistence. It provides CRUD operations for tasks, optional deadlines, and a minimal, easy-to-run developer experience.


## Features

- Create, read, update and delete tasks
- Each task can include a status and an optional deadline
- RESTful JSON API for backend
- React single-page frontend
- Health-check endpoint for backend

## Tech stack

- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB (Atlas or local)
- ORM: Mongoose
- Dev tooling: dotenv, cors

## Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MongoDB Atlas account or a running MongoDB instance

## Quick start

Follow these steps to run the app locally.

### Backend

1. Open a terminal and install dependencies:

```powershell
cd D:\TaskTronic\backend
npm install
```

2. Create an environment file in `backend` (for example `back.env` or `.env`) and set these variables:

```text
PORT=3001
MONGO_URI=your_mongodb_connection_string_here
```

Notes:
- For MongoDB Atlas you will typically use a connection string that begins with `mongodb+srv://` (SRV). If your network cannot resolve SRV records, use the "Standard connection string (without +srv)" shown in Atlas.

3. Start the backend:

```powershell
npm start
```

The backend will listen on `http://localhost:3001` by default.

### Frontend

1. Open another terminal and install frontend dependencies:

```powershell
cd D:\TaskTronic\frontend
npm install
```

2. Start the frontend dev server:

```powershell
npm start
```

The frontend typically runs at `http://localhost:3000` and will call the backend API at `http://localhost:3001`.

## Environment variables

- `PORT` — HTTP port for backend (default 3001)
- `MONGO_URI` — MongoDB connection string. Example (Atlas SRV):

```
mongodb+srv://<user>:<password>@cluster0.r220rbu.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Do not commit credentials to source control.

## API Endpoints

- `GET /api/tasks` — Get all tasks
- `POST /api/tasks` — Create a task (body: `{ task, status, deadline }`)
- `PUT /api/tasks/:id` — Update a task (body: `{ task, status, deadline }`)
- `DELETE /api/tasks/:id` — Delete a task
- `GET /api/health` — Health check

Responses are JSON.

## Troubleshooting

If your backend logs show errors like:

```
MongoDB connection error: Error: querySrv ENOTFOUND _mongodb._tcp.cluster0.r220rbu.mongodb.net
```

This indicates DNS SRV lookups for the `mongodb+srv://` URI failed. Common causes and fixes:

1. DNS / Network issues
	- Verify SRV resolution from your machine:

```powershell
nslookup -type=SRV _mongodb._tcp.cluster0.r220rbu.mongodb.net 8.8.8.8
# or (PowerShell):
Resolve-DnsName -Type SRV _mongodb._tcp.cluster0.r220rbu.mongodb.net
```

	- If the SRV record doesn't resolve, try a different network (home vs corp) or disable VPN.
	- Try using a public DNS server (8.8.8.8) in your network settings or specify it as shown above.

2. Typo or wrong cluster host
	- Confirm your cluster host in the Atlas UI (Clusters page) — use the exact host name Atlas provides.

3. Use non-SRV (standard) connection string as a workaround
	- In Atlas choose "Connect" → "Connect your application" → click to show the non-SRV connection string (it lists hosts and ports). Paste that into `MONGO_URI` to avoid SRV DNS lookups.

4. Atlas Network Access (IP whitelist)
	- After DNS is fixed and you can resolve the host, ensure your client IP is allowed in Atlas (Network Access → IP access list). Add your current public IP or `0.0.0.0/0` for quick testing (not recommended for production).

5. Credentials and DB name
	- Ensure the username, password, and database name in `MONGO_URI` are correct and that the user has the right privileges.

With the project changes, the backend includes retry logic and more helpful error logs on connection failure — check console logs for the retry attempts and hints.

## Project structure

```
TaskTronic/
  backend/
	 server.js        # Express API + MongoDB connection
	 models/          # Mongoose models (taskTronic.js)
	 package.json
	 back.env/.env    # (not committed) environment variables
  frontend/
	 src/
		App.js
		index.js
		components/Task.js
	 public/index.html
	 package.json
```
