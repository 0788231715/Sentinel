import json

import pytest

from app.services.realtime import MonitoringConnectionManager


class FakeWebSocket:
    def __init__(self):
        self.messages: list[str] = []
        self.accepted = False

    async def accept(self):
        self.accepted = True

    async def send_text(self, message: str):
        self.messages.append(message)


@pytest.mark.asyncio
async def test_monitoring_manager_isolates_connections_by_data_space():
    manager = MonitoringConnectionManager()
    simulation_client = FakeWebSocket()
    real_client = FakeWebSocket()
    await manager.connect(simulation_client, "simulation")
    await manager.connect(real_client, "real")
    assert simulation_client.accepted and real_client.accepted

    message = {"type": "event.created", "data": {"id": "evt-1"}}
    await manager.broadcast(message, "simulation")
    assert json.loads(simulation_client.messages[0]) == message
    assert real_client.messages == []

    await manager.disconnect(simulation_client, "simulation")
    await manager.broadcast({"type": "event.deleted", "data": {"id": "evt-1"}}, "simulation")
    assert len(simulation_client.messages) == 1
    await manager.disconnect(real_client, "real")
