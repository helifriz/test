from flask import Flask, render_template, request, jsonify
import os
import json
import tempfile

app = Flask(__name__)

# Path to the shared JSON data file. Use env variable to override
DATA_FILE = os.environ.get(
    'DATA_FILE', os.path.join(os.path.dirname(__file__), 'data.json')
)
PORT = int(os.environ.get('PORT', '8080'))


def load_data():
    """Load the shared JSON data file."""
    with open(DATA_FILE, 'r') as f:
        return json.load(f)


def save_data(data):
    """Atomically save the shared JSON data file."""
    directory = os.path.dirname(DATA_FILE)
    fd, tmp_path = tempfile.mkstemp(dir=directory)
    with os.fdopen(fd, 'w') as tmp:
        json.dump(data, tmp, indent=2)
    os.replace(tmp_path, DATA_FILE)


def add_entry(section, item, code=None):
    data = load_data()
    if section == 'waypoints':
        if not code:
            raise ValueError('Waypoint code required')
        data['waypoints'][code] = item
    else:
        data[section].append(item)
    save_data(data)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/manage')
def manage():
    return render_template('manage.html')


@app.route('/data')
def get_data():
    """Return the full data set as JSON."""
    return jsonify(load_data())


@app.route('/addPilot', methods=['POST'])
def add_pilot():
    payload = request.get_json(force=True)
    name = (payload.get('name') or '').strip()
    weight = payload.get('weight')
    if not name or weight is None:
        return jsonify({'error': 'Invalid data'}), 400
    data = load_data()
    if any(p.get('name', '').lower() == name.lower() for p in data.get('PILOTS', [])):
        return jsonify({'error': 'Pilot already exists'}), 400
    add_entry('PILOTS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})


@app.route('/addMedic', methods=['POST'])
def add_medic():
    payload = request.get_json(force=True)
    name = (payload.get('name') or '').strip()
    weight = payload.get('weight')
    if not name or weight is None:
        return jsonify({'error': 'Invalid data'}), 400
    data = load_data()
    if any(m.get('name', '').lower() == name.lower() for m in data.get('MEDICS', [])):
        return jsonify({'error': 'Medic already exists'}), 400
    add_entry('MEDICS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})


@app.route('/addWaypoint', methods=['POST'])
def add_waypoint():
    payload = request.get_json(force=True)
    code = (payload.get('code') or '').strip().upper()
    name = (payload.get('name') or '').strip()
    regions = payload.get('regions') or []
    lat = payload.get('lat')
    lon = payload.get('lon')
    if not code or not name or not regions or lat is None or lon is None:
        return jsonify({'error': 'Invalid data'}), 400
    data = load_data()
    if code in data.get('waypoints', {}):
        return jsonify({'error': 'Waypoint already exists'}), 400
    waypoint = {
        'name': name,
        'regions': regions,
        'lat': lat,
        'lon': lon,
    }
    add_entry('waypoints', waypoint, code=code)
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)
