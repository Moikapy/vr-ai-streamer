// server.js
import {ServerWebSocket} from 'bun';
import {getLLM} from '@/lib/llm';

// Error handling wrapper for LLM invocation
async function invokeLLM(message) {
  try {
    const llm = getLLM();
    
    const response = await llm.invoke(message);
    return {response: response.content};
  } catch (error) {
    console.error('LLM invocation error:', error.message);
    return {error: 'Failed to process message: ' + error.message};
  }
}

Bun.serve({
  port: 3001,
  async fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response('Not a WebSocket request', {status: 400});
  },
  websocket: {
    async message(ws, message) {
      console.log(
        'Received message:',
        message,
        !message.startsWith('>'),
        message[0],
        message[0] == '>'
      );
      clean_message = message.split(':')
      //if (!message.startsWith('>') || message[0] !== '>') return;
      const result = await invokeLLM(message);
      ws.send(JSON.stringify(result));
    },
    open(ws) {
      console.log('WebSocket connected');
    },
    close(ws) {
      console.log('WebSocket disconnected');
    },
    error(ws, error) {
      console.error('WebSocket error:', error);
    },
  },
});

console.log('WebSocket server running on ws://localhost:3001');
