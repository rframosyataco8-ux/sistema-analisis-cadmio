import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useSocket(onSampleUpdated?: (sample: any) => void, onSampleCreated?: (sample: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket conectado');
    });

    if (onSampleUpdated) {
      socket.on('sample:updated', onSampleUpdated);
    }
    if (onSampleCreated) {
      socket.on('sample:created', onSampleCreated);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
