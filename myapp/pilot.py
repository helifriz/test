from flask import Blueprint, request, jsonify, abort

try:
    from .data_utils import load_data, add_entry
except ImportError:  # Allow running as standalone module
    from data_utils import load_data, add_entry

pilot_bp = Blueprint('pilot_bp', __name__)


@pilot_bp.route('/addPilot', methods=['POST'])
def add_pilot():
    payload = request.get_json(force=True)
    name = (payload.get('name') or '').strip()
    try:
        weight = float(payload.get('weight'))
    except (TypeError, ValueError):
        weight = None

    if not name or weight is None:
        abort(400, description='Name and weight required')
    if not (0 < weight < 500):
        abort(400, description='Weight must be between 0 and 500')

    data = load_data()
    if any(p.get('name', '').lower() == name.lower() for p in data.get('PILOTS', [])):
        abort(409, description='Pilot already exists')

    add_entry('PILOTS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})
