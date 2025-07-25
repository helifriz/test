import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import json
import importlib
import os
import pytest

@pytest.fixture
def client(tmp_path, monkeypatch):
    data_file = tmp_path / 'data.json'
    initial = {
        'HELICOPTERS': [],
        'PILOTS': [],
        'MEDICS': [],
        'waypoints': {},
        'MAX_FUEL': 0,
        'MIN_FUEL': 0,
        'MAX_TAKEOFF_WEIGHT': 0,
    }
    data_file.write_text(json.dumps(initial))
    monkeypatch.setenv('DATA_FILE', str(data_file))
    import myapp.app as app_module
    importlib.reload(app_module)
    app = app_module.app
    with app.test_client() as client:
        yield client

def test_get_data(client):
    resp = client.get('/data')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['PILOTS'] == []
    assert data['MEDICS'] == []
    assert data['waypoints'] == {}

def test_add_pilot(client):
    resp = client.post('/addPilot', json={'name': 'Test Pilot', 'weight': 80})
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'ok'
    data = client.get('/data').get_json()
    assert {'name': 'Test Pilot', 'weight': 80} in data['PILOTS']

def test_add_medic(client):
    resp = client.post('/addMedic', json={'name': 'Test Medic', 'weight': 70})
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'ok'
    data = client.get('/data').get_json()
    assert {'name': 'Test Medic', 'weight': 70} in data['MEDICS']

def test_add_waypoint(client):
    payload = {
        'code': 'TEST',
        'name': 'Test Point',
        'lat': 49.2,
        'lon': -123.1,
        'elev': 100,
    }
    resp = client.post('/addWaypoint', json=payload)
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'ok'
    data = client.get('/data').get_json()
    assert payload['code'] in data['waypoints']
    wp = data['waypoints'][payload['code']]
    assert wp['name'] == 'Test Point'
    assert wp['lat'] == 49.2
    assert wp['lon'] == -123.1
    for region in ['ALL', 'Vancouver', 'Parksville', 'Kamloops']:
        assert region in wp['regions']
    assert wp['elev'] == 100


def test_add_pilot_invalid_weight(client):
    resp = client.post('/addPilot', json={'name': 'Bad', 'weight': -1})
    assert resp.status_code == 400
    assert 'weight' in resp.get_json()['error'].lower()


def test_add_pilot_duplicate(client):
    client.post('/addPilot', json={'name': 'Dup', 'weight': 75})
    resp = client.post('/addPilot', json={'name': 'Dup', 'weight': 75})
    assert resp.status_code == 409


def test_add_waypoint_invalid_lat(client):
    payload = {
        'code': 'BAD',
        'name': 'Bad Point',
        'lat': 95.0,
        'lon': 0.0,
        'elev': 10,
    }
    resp = client.post('/addWaypoint', json=payload)
    assert resp.status_code == 400


def test_add_waypoint_outside_bc(client):
    payload = {
        'code': 'OUTBC',
        'name': 'Outside BC',
        'lat': 47.0,
        'lon': -123.1,
        'elev': 50,
    }
    resp = client.post('/addWaypoint', json=payload)
    assert resp.status_code == 400
    assert 'British Columbia' in resp.get_json()['error']

