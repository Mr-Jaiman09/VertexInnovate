import pytest
from app import create_app
from config import Config

@pytest.fixture
def client():
    app, _ = create_app(Config)
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'