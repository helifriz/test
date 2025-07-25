from flask import Blueprint, request, jsonify, abort
import math

try:
    from .data_utils import load_data, add_entry
except ImportError:
    from data_utils import load_data, add_entry

waypoint_bp = Blueprint('waypoint_bp', __name__)

# Coordinates for helicopter bases used for automatic region assignment
BASE_COORDS = {
    "Vancouver": {"lat": 49.1939, "lon": -123.1833},
    "Parksville": {"lat": 49.3129, "lon": -124.3686},
    "Kamloops": {"lat": 50.7022, "lon": -120.4443},
    "Prince George": {"lat": 53.8833, "lon": -122.6783},
    "Prince Rupert": {"lat": 54.4685, "lon": -128.5762},
}

# Bounding box for British Columbia (approximate)
BC_BOUNDS = {
    "min_lat": 48.3,
    "max_lat": 60.0,
    "min_lon": -139.1,
    "max_lon": -114.0,
}


def haversine_nm(lat1, lon1, lat2, lon2):
    """Return distance between two lat/lon pairs in nautical miles."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    km = 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return km * 0.539957  # convert km to nautical miles


@waypoint_bp.route('/addWaypoint', methods=['POST'])
def add_waypoint():
    payload = request.get_json(force=True)
    code = (payload.get('code') or '').strip().upper()
    name = (payload.get('name') or '').strip()
    user_regions = payload.get('regions') or []
    lat = payload.get('lat')
    lon = payload.get('lon')
    elev = payload.get('elev')

    try:
        lat = float(lat)
        lon = float(lon)
        elev = float(elev)
    except (TypeError, ValueError):
        abort(400, description='Invalid numeric values')

    if not code or not name:
        abort(400, description='Missing required fields')
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        abort(400, description='Coordinates out of range')
    if not (
        BC_BOUNDS["min_lat"] <= lat <= BC_BOUNDS["max_lat"]
        and BC_BOUNDS["min_lon"] <= lon <= BC_BOUNDS["max_lon"]
    ):
        abort(400, description='Coordinates must be within British Columbia')
    if not (-1000 <= elev <= 15000):
        abort(400, description='Elevation out of range')

    data = load_data()
    if code in data.get('waypoints', {}):
        abort(409, description='Waypoint already exists')

    # Determine regions automatically based on proximity to bases
    regions = [r for r in user_regions if r]
    if 'ALL' not in regions:
        regions.insert(0, 'ALL')
    for base, coords in BASE_COORDS.items():
        if haversine_nm(lat, lon, coords['lat'], coords['lon']) <= 200:
            if base not in regions:
                regions.append(base)

    waypoint = {
        'name': name,
        'regions': regions,
        'lat': lat,
        'lon': lon,
        'elev': elev,
    }
    add_entry('waypoints', waypoint, code=code)
    return jsonify({'status': 'ok'})
