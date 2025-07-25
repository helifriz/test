from flask import Blueprint, request, jsonify, abort

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

    try:
        lat = float(lat)
        lon = float(lon)
        elev = float(elev)
    except (TypeError, ValueError):
        abort(400, description='Invalid numeric values')

    if not code or not name or not regions:
        abort(400, description='Missing required fields')
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        abort(400, description='Coordinates out of range')
    if not (-1000 <= elev <= 15000):
        abort(400, description='Elevation out of range')

    data = load_data()
    if code in data.get('waypoints', {}):
        abort(409, description='Waypoint already exists')

    waypoint = {
        'name': name,
        'regions': regions,
        'lat': lat,
        'lon': lon,
        'elev': elev,
    }
    add_entry('waypoints', waypoint, code=code)
    return jsonify({'status': 'ok'})
