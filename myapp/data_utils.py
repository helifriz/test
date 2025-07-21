import os
import json
import tempfile

DATA_FILE = os.environ.get('DATA_FILE', os.path.join(os.path.dirname(__file__), 'data.json'))

DEFAULT_DATA = {
    'HELICOPTERS': [],
    'PILOTS': [],
    'MEDICS': [],
    'waypoints': {},
    'MAX_FUEL': 0,
    'MIN_FUEL': 0,
    'MAX_TAKEOFF_WEIGHT': 0,
}


def load_data():
    """Load the shared JSON data file or initialize it if missing."""
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULT_DATA)
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        save_data(DEFAULT_DATA)
        with open(DATA_FILE, 'r') as f:
            return json.load(f)


def save_data(data):
    """Atomically save the shared JSON data file."""
    directory = os.path.dirname(DATA_FILE)
    os.makedirs(directory, exist_ok=True)
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
