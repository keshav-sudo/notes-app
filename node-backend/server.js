const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
const client = new MongoClient(process.env.DB_URI);

async function connectDB() {
    try {
        await client.connect();
        db = client.db(process.env.DB_NAME);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

// Routes

// Get All Notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await db.collection('notes').find({}).toArray();
        // Transform _id to id for consistency
        const transformedNotes = notes.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at
        }));
        res.json(transformedNotes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});

// Create Note
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        const now = new Date();
        
        const note = {
            title: title || 'Untitled Note',
            content: content || 'No Content',
            created_at: now,
            updated_at: now
        };

        const result = await db.collection('notes').insertOne(note);
        
        res.status(201).json({
            id: result.insertedId,
            ...note
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Get Note By ID
app.get('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            id: note._id,
            title: note.title,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
});

// Benchmark Routes

// Ping - Raw HTTP speed test
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', backend: 'node' });
});

// CPU Test - Fibonacci calculation
app.get('/api/cpu/:n', (req, res) => {
    const n = parseInt(req.params.n) || 30;
    const result = fibonacci(n);
    res.json({ result, n, backend: 'node' });
});

// High Concurrency Test - Simulate concurrent work
app.get('/api/concurrent/:n', async (req, res) => {
    const n = parseInt(req.params.n) || 100;
    const results = [];
    
    // Node.js is single-threaded, so we use Promise.all
    const promises = [];
    for (let i = 0; i < n; i++) {
        promises.push(new Promise(resolve => {
            // Each "concurrent" task does some work
            const result = fibonacci(25);
            resolve(result);
        }));
    }
    
    const completed = await Promise.all(promises);
    
    res.json({
        workers: n,
        completed: completed.length,
        backend: 'node'
    });
});

// JSON Processing - Parse and serialize large data
app.post('/api/json', (req, res) => {
    let data = req.body;
    
    if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Expected array' });
    }
    
    // Process each item
    data = data.map((item, index) => ({
        ...item,
        processed: true,
        index
    }));
    
    res.json({
        items: data.length,
        backend: 'node',
        data
    });
});

// CPU intensive function
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Node.js Notes API running on port ${PORT}`);
    });
});
