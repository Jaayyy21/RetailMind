import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (storeId) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('connecting');
  const ws = useRef(null);

  // Fallback to localhost if env is not set
  const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/analytics';
  const url = `${baseUrl}/${storeId}/`;

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    console.log('🔌 Connecting to WebSocket:', url);
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('✅ WebSocket Connected');
      setStatus('connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(message);
      } catch (err) {
        console.error('❌ Failed to parse WebSocket message:', err);
      }
    };

    ws.current.onclose = (event) => {
      console.log('⚠️ WebSocket Disconnected. Retrying in 3s...', event.reason);
      setStatus('disconnected');
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (err) => {
      console.error('❌ WebSocket Error:', err);
      ws.current.close();
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        console.log('🔌 Closing WebSocket connection');
        ws.current.close();
      }
    };
  }, [connect]);

  return { data, status };
};
