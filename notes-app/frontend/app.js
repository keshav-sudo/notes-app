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

// Run Latency Test
async function runLatencyTest() {
    const count = parseInt(document.getElementById('noteCount').value) || 10;
    
    // Show results section
    document.getElementById('latencyResult').classList.remove('hidden');
    document.getElementById('winner').classList.add('hidden');
    
    // Reset displays
    document.getElementById('nodeTime').textContent = '...';
    document.getElementById('goTime').textContent = '...';
    document.getElementById('nodeStatus').textContent = 'Testing...';
    document.getElementById('goStatus').textContent = 'Testing...';
    
    let nodeTime = null;
    let goTime = null;
    
    // Test Node.js
    try {
        const nodeStart = performance.now();
        const promises = [];
        
        for (let i = 0; i < count; i++) {
            promises.push(fetch(`${NODE_API}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Test Note ${i + 1}`,
                    content: `Latency test content ${Date.now()}`
                })
            }));
        }
        
        await Promise.all(promises);
        nodeTime = Math.round(performance.now() - nodeStart);
        
        document.getElementById('nodeTime').textContent = nodeTime;
        document.getElementById('nodeStatus').textContent = `✅ Created ${count} notes`;
    } catch (error) {
        document.getElementById('nodeTime').textContent = '❌';
        document.getElementById('nodeStatus').textContent = 'Server not running';
    }
    
    // Test Go
    try {
        const goStart = performance.now();
        const promises = [];
        
        for (let i = 0; i < count; i++) {
            promises.push(fetch(`${GO_API}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Test Note ${i + 1}`,
                    content: `Latency test content ${Date.now()}`
                })
            }));
        }
        
        await Promise.all(promises);
        goTime = Math.round(performance.now() - goStart);
        
        document.getElementById('goTime').textContent = goTime;
        document.getElementById('goStatus').textContent = `✅ Created ${count} notes`;
    } catch (error) {
        document.getElementById('goTime').textContent = '❌';
        document.getElementById('goStatus').textContent = 'Server not running';
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
