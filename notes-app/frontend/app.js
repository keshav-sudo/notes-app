// API Endpoints
const NODE_API = 'http://localhost:9001/api';
const GO_API = 'http://localhost:9000/api';

// Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Add active to clicked tab
        tab.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        // Show selected section
        const sectionId = tab.dataset.tab;
        document.getElementById(sectionId).classList.add('active');
    });
});

// Helper function to get API URL
function getApiUrl(backend) {
    return backend === 'node' ? NODE_API : GO_API;
}

// Helper function to show result
function showResult(elementId, data, isError = false) {
    const resultBox = document.getElementById(elementId);
    resultBox.classList.remove('hidden', 'success', 'error');
    resultBox.classList.add(isError ? 'error' : 'success');
    resultBox.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

// Create Note
async function createNote(backend) {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    
    try {
        const response = await fetch(`${getApiUrl(backend)}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showResult('createResult', {
                message: `✅ Note created successfully with ${backend.toUpperCase()}!`,
                note: data
            });
            // Clear form
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
        } else {
            showResult('createResult', data, true);
        }
    } catch (error) {
        showResult('createResult', `❌ Error: ${error.message}. Make sure ${backend.toUpperCase()} server is running!`, true);
    }
}

// Get All Notes
async function getAllNotes(backend) {
    try {
        const response = await fetch(`${getApiUrl(backend)}/notes`);
        const data = await response.json();
        
        showResult('viewResult', {
            backend: backend.toUpperCase(),
            count: data.length,
            notes: data
        });
    } catch (error) {
        showResult('viewResult', `❌ Error: ${error.message}. Make sure ${backend.toUpperCase()} server is running!`, true);
    }
}

// Get Note By ID
async function getNoteById(backend) {
    const noteId = document.getElementById('noteId').value.trim();
    
    if (!noteId) {
        showResult('viewResult', '❌ Please enter a Note ID', true);
        return;
    }
    
    try {
        const response = await fetch(`${getApiUrl(backend)}/notes/${noteId}`);
        const data = await response.json();
        
        if (response.ok) {
            showResult('viewResult', {
                backend: backend.toUpperCase(),
                note: data
            });
        } else {
            showResult('viewResult', data, true);
        }
    } catch (error) {
        showResult('viewResult', `❌ Error: ${error.message}. Make sure ${backend.toUpperCase()} server is running!`, true);
    }
}

// Helper function to create notes in batches
async function createNotesInBatches(apiUrl, count, batchSize = 20) {
    const start = performance.now();
    let created = 0;
    
    for (let i = 0; i < count; i += batchSize) {
        const currentBatch = Math.min(batchSize, count - i);
        const promises = [];
        
        for (let j = 0; j < currentBatch; j++) {
            promises.push(fetch(`${apiUrl}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Test Note ${i + j + 1}`,
                    content: `Latency test content ${Date.now()}`
                })
            }));
        }
        
        await Promise.all(promises);
        created += currentBatch;
        
        // Small delay between batches to prevent overwhelming
        if (i + batchSize < count) {
            await new Promise(r => setTimeout(r, 10));
        }
    }
    
    return {
        time: Math.round(performance.now() - start),
        count: created,
        message: `Created ${created} notes`
    };
}

// Run Latency Test
async function runLatencyTest() {
    const count = parseInt(document.getElementById('noteCount').value) || 10;
    const testType = document.querySelector('input[name="testType"]:checked')?.value || 'db';
    
    if (count > 1000) {
        alert('Maximum 1000 requests allowed!');
        return;
    }
    
    // Show results section
    document.getElementById('latencyResult').classList.remove('hidden');
    document.getElementById('winner').classList.add('hidden');
    
    // Get test label
    const testLabels = {
        'db': 'Database',
        'ping': 'Ping',
        'cpu': 'CPU Heavy',
        'concurrent': 'Concurrency',
        'json': 'JSON Processing'
    };
    
    // Reset displays
    document.getElementById('nodeTime').textContent = '...';
    document.getElementById('goTime').textContent = '...';
    document.getElementById('nodeStatus').textContent = `Testing ${testLabels[testType]}...`;
    document.getElementById('goStatus').textContent = 'Waiting...';
    
    let nodeTime = null;
    let goTime = null;
    
    // Test Node.js
    try {
        const result = await runTest(NODE_API, testType, count);
        nodeTime = result.time;
        
        document.getElementById('nodeTime').textContent = nodeTime;
        document.getElementById('nodeStatus').textContent = `✅ ${result.message}`;
    } catch (error) {
        document.getElementById('nodeTime').textContent = '❌';
        document.getElementById('nodeStatus').textContent = 'Error: ' + error.message;
    }
    
    // Update Go status
    document.getElementById('goStatus').textContent = `Testing ${testLabels[testType]}...`;
    
    // Test Go
    try {
        const result = await runTest(GO_API, testType, count);
        goTime = result.time;
        
        document.getElementById('goTime').textContent = goTime;
        document.getElementById('goStatus').textContent = `✅ ${result.message}`;
    } catch (error) {
        document.getElementById('goTime').textContent = '❌';
        document.getElementById('goStatus').textContent = 'Error: ' + error.message;
    }
    
    // Show winner
    if (nodeTime !== null && goTime !== null) {
        const winnerBanner = document.getElementById('winner');
        winnerBanner.classList.remove('hidden', 'node-wins', 'go-wins', 'tie');
        
        if (nodeTime < goTime) {
            winnerBanner.classList.add('node-wins');
            winnerBanner.textContent = `🏆 Node.js wins! ${goTime - nodeTime}ms faster`;
        } else if (goTime < nodeTime) {
            winnerBanner.classList.add('go-wins');
            winnerBanner.textContent = `🏆 Go wins! ${nodeTime - goTime}ms faster`;
        } else {
            winnerBanner.classList.add('tie');
            winnerBanner.textContent = `🤝 It's a tie! Both took ${nodeTime}ms`;
        }
    }
}

// Run specific test type
async function runTest(apiUrl, testType, count) {
    switch (testType) {
        case 'ping':
            return await runPingTest(apiUrl, count);
        case 'cpu':
            return await runCpuTest(apiUrl, count);
        case 'concurrent':
            return await runConcurrentTest(apiUrl, count);
        case 'json':
            return await runJsonTest(apiUrl, count);
        case 'db':
        default:
            return await createNotesInBatches(apiUrl, count);
    }
}

// Ping Test - Raw HTTP speed
async function runPingTest(apiUrl, count) {
    const start = performance.now();
    
    for (let i = 0; i < count; i += 20) {
        const batch = Math.min(20, count - i);
        const promises = [];
        for (let j = 0; j < batch; j++) {
            promises.push(fetch(`${apiUrl}/ping`));
        }
        await Promise.all(promises);
    }
    
    return {
        time: Math.round(performance.now() - start),
        message: `${count} ping requests completed`
    };
}

// CPU Test - Fibonacci calculation
async function runCpuTest(apiUrl, count) {
    const start = performance.now();
    const n = 35; // Fibonacci(35) - heavy calculation
    
    for (let i = 0; i < count; i += 5) {
        const batch = Math.min(5, count - i);
        const promises = [];
        for (let j = 0; j < batch; j++) {
            promises.push(fetch(`${apiUrl}/cpu/${n}`));
        }
        await Promise.all(promises);
    }
    
    return {
        time: Math.round(performance.now() - start),
        message: `${count} CPU calculations (fib ${n})`
    };
}

// High Concurrency Test - Tests goroutines vs event loop
async function runConcurrentTest(apiUrl, count) {
    const start = performance.now();
    const workers = 500; // Each request spawns 500 concurrent workers
    
    for (let i = 0; i < count; i += 3) {
        const batch = Math.min(3, count - i);
        const promises = [];
        for (let j = 0; j < batch; j++) {
            promises.push(fetch(`${apiUrl}/concurrent/${workers}`));
        }
        await Promise.all(promises);
    }
    
    return {
        time: Math.round(performance.now() - start),
        message: `${count} x ${workers} concurrent tasks`
    };
}

// JSON Processing Test - Large data serialization
async function runJsonTest(apiUrl, count) {
    const start = performance.now();
    
    // Generate large JSON payload
    const generatePayload = (size) => {
        const items = [];
        for (let i = 0; i < size; i++) {
            items.push({
                id: i,
                name: `Item ${i}`,
                value: Math.random() * 1000,
                data: 'x'.repeat(100)
            });
        }
        return items;
    };
    
    for (let i = 0; i < count; i += 5) {
        const batch = Math.min(5, count - i);
        const promises = [];
        for (let j = 0; j < batch; j++) {
            promises.push(fetch(`${apiUrl}/json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generatePayload(100))
            }));
        }
        await Promise.all(promises);
    }
    
    return {
        time: Math.round(performance.now() - start),
        message: `${count} JSON ops (100 items each)`
    };
}
