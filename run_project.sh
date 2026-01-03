#!/bin/bash

# Function to handle cleanup on script exit
cleanup() {
    echo "\nStopping all servers..."
    # Kill all child processes in the current process group
    kill 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

echo "Starting Notes App Project..."

# Start Node.js Backend
echo "Starting Node.js Backend (Port 3000)..."
cd node-backend
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi
npm start &
cd ..

# Start Go Backend
echo "Starting Go Backend (Port 8080)..."
cd go-backend
go run cmd/api/main.go &
cd ..

echo "Both servers are running..."
echo "Node API: http://localhost:3000"
echo "Go API:   http://localhost:8080"
echo "Press Ctrl+C to stop both servers."

# Wait for any process to exit
wait
