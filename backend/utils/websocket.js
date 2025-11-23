import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocket(server) {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized');
}

export function broadcast(event, data) {
    if (!wss) return;

    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// Event types:
// - scan:started
// - scan:complete (with device count)
// - devices:updated
// - config:updated (when subnet or intervals change)
