from flask import Blueprint, request, jsonify

try:
    from .data_utils import load_data, add_entry
except ImportError:
    from data_utils import load_data, add_entry

waypoint_bp = Blueprint('waypoint_bp', __name__)


@waypoint_bp.route('/addWaypoint', methods=['POST'])
def add_waypoint():
    payload = request.get_json(force=True)
    code = (payload.get('code') or '').strip().upper()
    name = (payload.get('name') or '').strip()
    regions = payload.get('regions') or []
    lat = payload.get('lat')
    lon = payload.get('lon')
    elev = payload.get('elev')
    if not code or not name or not regions or lat is None or lon is None or elev is None:
        return jsonify({'error': 'Invalid data'}), 400
    data = load_data()
    if code in data.get('waypoints', {}):
        return jsonify({'error': 'Waypoint already exists'}), 400
    waypoint = {
        'name': name,
        'regions': regions,
        'lat': lat,
        'lon': lon,
        'elev': elev,
    }
    add_entry('waypoints', waypoint, code=code)
    return jsonify({'status': 'ok'})
