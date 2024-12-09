const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let documentState = '';
const clients = new Set();

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
        type: 'init',
        document: documentState
    }));

    clients.add(ws);

    ws.on('message', (message) => {
        const operation = JSON.parse(message);
        
        // Broadcast to other clients
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(operation));
            }
        });

        // Update server state
        if (operation.type === 'insert') {
            documentState = documentState.slice(0, operation.pos) + 
                          operation.char + 
                          documentState.slice(operation.pos);
        } else if (operation.type === 'delete') {
            documentState = documentState.slice(0, operation.pos) + 
                          documentState.slice(operation.pos + operation.length);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Store the current document state and client connections
// let documentState = '';
// const clients = new Set();

// // Operational Transformation Utility
// class OTUtility {
//     // Insert operation transformation
//     static transformInsert(op1, op2) {
//         const { pos: pos1 } = op1;
//         const { pos: pos2 } = op2;

//         if (pos1 < pos2) {
//             return { ...op2, pos: pos2 + 1 };
//         } else if (pos1 > pos2) {
//             return { ...op1, pos: op1.pos + 1 };
//         } else {
//             // Tie-breaker (using timestamp as an example)
//             return op2.timestamp > op1.timestamp ? op2 : op1;
//         }
//     }

//     // Delete operation transformation
//     static transformDelete(op1, op2) {
//         const { pos: pos1, length: len1 } = op1;
//         const { pos: pos2, length: len2 } = op2;

//         if (pos1 < pos2) {
//             return { ...op2, pos: pos2 - len1 };
//         } else if (pos1 > pos2) {
//             return { ...op1, pos: op1.pos - len2 };
//         } else {
//             // Overlapping or conflicting deletes
//             return null; // Handle with more complex conflict resolution
//         }
//     }

//     // Apply operation to document
//     static applyOperation(doc, op) {
//         const { type, pos, char, length } = op;
//         if (type === 'insert') {
//             return doc.slice(0, pos) + char + doc.slice(pos);
//         } else if (type === 'delete') {
//             return doc.slice(0, pos) + doc.slice(pos + length);
//         }
//         return doc;
//     }
// }

// // WebSocket connection handler
// wss.on('connection', (ws) => {
//     // Send current document state to new client
//     ws.send(JSON.stringify({
//         type: 'init',
//         document: documentState
//     }));

//     // Add client to set
//     clients.add(ws);

//     // Handle incoming operations
//     ws.on('message', (message) => {
//         const operation = JSON.parse(message);
        
//         // Broadcast operation to all other clients
//         clients.forEach((client) => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify(operation));
//             }
//         });

//         // Apply operation to document state
//         documentState = OTUtility.applyOperation(documentState, operation);
//     });

//     // Remove client on disconnect
//     ws.on('close', () => {
//         clients.delete(ws);
//     });
// });

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// // Enhanced Logging Utility
// class Logger {
//     static logFile = path.join(__dirname, 'ot-log.txt');

//     static log(message) {
//         const timestamp = new Date().toISOString();
//         const logMessage = `[${timestamp}] ${message}\n`;
        
//         // Console log
//         console.log(logMessage.trim());
        
//         // File log
//         fs.appendFile(this.logFile, logMessage, (err) => {
//             if (err) console.error('Failed to write to log file:', err);
//         });
//     }

//     static clearLog() {
//         fs.writeFileSync(this.logFile, '');
//     }
// }

// // Store the current document state and client connections
// let documentState = '';
// const clients = new Set();

// // Enhanced Operational Transformation Utility
// class OTUtility {
//     // Insert operation transformation with detailed logging
//     static transformInsert(op1, op2) {
//         const { pos: pos1 } = op1;
//         const { pos: pos2 } = op2;

//         Logger.log(`Transforming Insert Operations:`);
//         Logger.log(`Op1: Position ${pos1}, Op2: Position ${pos2}`);

//         if (pos1 < pos2) {
//             const transformedOp = { ...op2, pos: pos2 + 1 };
//             Logger.log(`Result: Adjusted Op2 position to ${transformedOp.pos}`);
//             return transformedOp;
//         } else if (pos1 > pos2) {
//             const transformedOp = { ...op1, pos: op1.pos + 1 };
//             Logger.log(`Result: Adjusted Op1 position to ${transformedOp.pos}`);
//             return transformedOp;
//         } else {
//             // Tie-breaker (using timestamp as an example)
//             const selectedOp = op2.timestamp > op1.timestamp ? op2 : op1;
//             Logger.log(`Conflict: Equal positions. Selected operation based on timestamp.`);
//             return selectedOp;
//         }
//     }

//     // Delete operation transformation with detailed logging
//     static transformDelete(op1, op2) {
//         const { pos: pos1, length: len1 } = op1;
//         const { pos: pos2, length: len2 } = op2;

//         Logger.log(`Transforming Delete Operations:`);
//         Logger.log(`Op1: Position ${pos1}, Length ${len1}, Op2: Position ${pos2}, Length ${len2}`);

//         if (pos1 < pos2) {
//             const transformedOp = { ...op2, pos: pos2 - len1 };
//             Logger.log(`Result: Adjusted Op2 position to ${transformedOp.pos}`);
//             return transformedOp;
//         } else if (pos1 > pos2) {
//             const transformedOp = { ...op1, pos: op1.pos - len2 };
//             Logger.log(`Result: Adjusted Op1 position to ${transformedOp.pos}`);
//             return transformedOp;
//         } else {
//             // Overlapping or conflicting deletes
//             Logger.log(`Conflict: Overlapping delete operations`);
//             return null;
//         }
//     }

//     // Apply operation to document with detailed logging
//     static applyOperation(doc, op) {
//         const { type, pos, char, length } = op;
        
//         Logger.log(`Applying Operation:`);
//         Logger.log(`Type: ${type}, Position: ${pos}, ${type === 'insert' ? `Char: ${char}` : `Length: ${length}`}`);
//         Logger.log(`Current Document: "${doc}"`);

//         let result;
//         if (type === 'insert') {
//             result = doc.slice(0, pos) + char + doc.slice(pos);
//             Logger.log(`Result: "${result}"`);
//         } else if (type === 'delete') {
//             result = doc.slice(0, pos) + doc.slice(pos + length);
//             Logger.log(`Result: "${result}"`);
//         }

//         return result;
//     }
// }

// // WebSocket connection handler
// wss.on('connection', (ws) => {
//     // Clear log file on new connection
//     Logger.clearLog();
    
//     Logger.log('New client connected');

//     // Send current document state to new client
//     ws.send(JSON.stringify({
//         type: 'init',
//         document: documentState
//     }));

//     // Add client to set
//     clients.add(ws);

//     // Handle incoming operations
//     ws.on('message', (message) => {
//         const operation = JSON.parse(message);
        
//         Logger.log(`Received Operation: ${JSON.stringify(operation)}`);

//         // Broadcast operation to all other clients
//         clients.forEach((client) => {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify(operation));
//                 Logger.log(`Broadcasted operation to client`);
//             }
//         });

//         // Apply operation to document state
//         documentState = OTUtility.applyOperation(documentState, operation);
//         Logger.log(`Updated Document State: "${documentState}"`);
//     });

//     // Remove client on disconnect
//     ws.on('close', () => {
//         clients.delete(ws);
//         Logger.log('Client disconnected');
//     });
// });

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     Logger.log(`Server started on port ${PORT}`);
// });
