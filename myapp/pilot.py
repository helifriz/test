from flask import Blueprint, request, jsonify

from .data_utils import load_data, add_entry

pilot_bp = Blueprint('pilot_bp', __name__)


@pilot_bp.route('/addPilot', methods=['POST'])
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
