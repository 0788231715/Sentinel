import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect


class MonitoringConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, space: str) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(space, set()).add(websocket)

    async def disconnect(self, websocket: WebSocket, space: str) -> None:
        async with self._lock:
            connections = self._connections.get(space)
            if connections is not None:
                connections.discard(websocket)
                if not connections:
                    self._connections.pop(space, None)

    async def broadcast(self, message: dict[str, object], space: str) -> None:
        payload = json.dumps(message)
        async with self._lock:
            connections = tuple(self._connections.get(space, ()))
        stale: list[WebSocket] = []
        for connection in connections:
            try:
                await connection.send_text(payload)
            except (RuntimeError, WebSocketDisconnect):
                stale.append(connection)
        if stale:
            async with self._lock:
                space_connections = self._connections.get(space)
                if space_connections is not None:
                    space_connections.difference_update(stale)
                    if not space_connections:
                        self._connections.pop(space, None)


monitoring_connections = MonitoringConnectionManager()
