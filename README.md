# Notes App - Node.js vs Go Comparison

A simple notes application to compare **Node.js** and **Go** backend performance.

## 📁 Project Structure

```
notes-app/
├── go-backend/       # Go backend (Fiber + MongoDB)
│   ├── cmd/api/      # Main entry point
│   ├── internals/    # Internal packages
│   └── .env          # Environment variables
│
├── node-backend/     # Node.js backend (Express + MongoDB)
│   ├── server.js     # Main server file
│   └── .env          # Environment variables
│
├── frontend/         # Static HTML/CSS/JS frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── README.md
```

## 🚀 How to Run

### 1. Start Go Backend (Port 9000)

```bash
cd notes-app/go-backend
go run cmd/api/main.go
```

### 2. Start Node.js Backend (Port 9001)

```bash
cd notes-app/node-backend
npm start
```

### 3. Open Frontend

Open `frontend/index.html` in your browser.

Or use Live Server:
```bash
cd frontend
npx serve .
```

## 🔗 API Endpoints

Both backends have the same API:

| Method | Endpoint         | Description      |
|--------|------------------|------------------|
| GET    | `/api/notes`     | Get all notes    |
| POST   | `/api/notes`     | Create a note    |
| GET    | `/api/notes/:id` | Get note by ID   |

## 🎯 Features

- ✅ **Create Notes** - with Node.js or Go
- ✅ **View Notes** - Get all or by ID
- ✅ **Latency Test** - Create multiple notes and compare response times

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Go Backend | Fiber, MongoDB Driver |
| Node Backend | Express, MongoDB Node Driver |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | MongoDB Atlas |

## 📊 Ports

- **Go**: `http://localhost:9000`
- **Node.js**: `http://localhost:9001`
