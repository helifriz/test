import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import json
import pytest
import myapp.app as app_module

@pytest.fixture
def client(tmp_path):
    data = {
        "HELICOPTERS": [],
        "MAX_FUEL": 100,
        "MIN_FUEL": 10,
        "MAX_TAKEOFF_WEIGHT": 1000,
        "waypoints": {},
        "PILOTS": [],
        "MEDICS": []
    }
    data_file = tmp_path / "data.json"
    data_file.write_text(json.dumps(data))
    original = app_module.DATA_FILE
    app_module.DATA_FILE = str(data_file)
    app_module.app.testing = True
    with app_module.app.test_client() as client:
        yield client
    app_module.DATA_FILE = original

def test_get_data(client):
    resp = client.get('/data')
    assert resp.status_code == 200
    assert resp.get_json() == app_module.load_data()

def test_add_pilot(client):
    resp = client.post('/addPilot', json={'name': 'John', 'weight': 75})
    assert resp.status_code == 200
    assert resp.get_json() == {'status': 'ok'}
    data = app_module.load_data()
    assert {'name': 'John', 'weight': 75} in data['PILOTS']
    dup = client.post('/addPilot', json={'name': 'John', 'weight': 75})
    assert dup.status_code == 400

def test_add_medic(client):
    resp = client.post('/addMedic', json={'name': 'Jane', 'weight': 65})
    assert resp.status_code == 200
    assert resp.get_json() == {'status': 'ok'}
    data = app_module.load_data()
    assert {'name': 'Jane', 'weight': 65} in data['MEDICS']
    dup = client.post('/addMedic', json={'name': 'Jane', 'weight': 65})
    assert dup.status_code == 400

def test_add_waypoint(client):
    waypoint = {
        'code': 'TEST',
        'name': 'Test Point',
        'regions': ['A', 'ALL'],
        'lat': 1.0,
        'lon': 2.0
    }
    resp = client.post('/addWaypoint', json=waypoint)
    assert resp.status_code == 200
    assert resp.get_json() == {'status': 'ok'}
    data = app_module.load_data()
    assert 'TEST' in data['waypoints']
    assert data['waypoints']['TEST']['name'] == 'Test Point'
    dup = client.post('/addWaypoint', json=waypoint)
    assert dup.status_code == 400
