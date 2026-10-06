import { useEffect, useState } from 'react';
import { useDataSpaceStore } from '../store/dataSpaceStore';

type SocketState = 'disconnected' | 'connecting' | 'connected' | 'error';

function websocketUrl(token: string, space: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const socketBase = import.meta.env.VITE_WS_URL || apiUrl.replace(/^http/, 'ws').replace(/\/api\/v1\/?$/, '');
  return `${socketBase.replace(/\/$/, '')}/api/v1/monitoring/ws?token=${encodeURIComponent(token)}&space=${space}`;
}

export function useMonitoringSocket(enabled: boolean, onMessage: () => void): SocketState {
  const [state, setState] = useState<SocketState>('disconnected');
  const space = useDataSpaceStore((store) => store.space);

  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem('sentinel.accessToken');
    if (!token) return;

    let socket: WebSocket | undefined;
    let retryTimer: number | undefined;
    let heartbeatTimer: number | undefined;
    let disposed = false;
    let retryDelay = 1000;

    const connect = () => {
      if (disposed) return;
      setState('connecting');
      socket = new WebSocket(websocketUrl(token, space));
      socket.onopen = () => {
        retryDelay = 1000;
        setState('connected');
        heartbeatTimer = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };
      socket.onmessage = (event) => {
        let message: { type?: string };
        try {
          message = JSON.parse(String(event.data)) as { type?: string };
        } catch {
          setState('error');
          return;
        }
        if (message.type !== 'heartbeat' && message.type !== 'pong') onMessage();
      };
      socket.onerror = () => setState('error');
      socket.onclose = () => {
        if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer);
        if (disposed) return;
        setState('disconnected');
        retryTimer = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      };
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (heartbeatTimer !== undefined) window.clearInterval(heartbeatTimer);
      socket?.close();
    };
  }, [enabled, onMessage, space]);

  if (!enabled) return 'disconnected';
  if (!localStorage.getItem('sentinel.accessToken')) return 'error';
  return state;
}
