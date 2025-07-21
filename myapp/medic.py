from flask import Blueprint, request, jsonify

from .data_utils import load_data, add_entry

medic_bp = Blueprint('medic_bp', __name__)


@medic_bp.route('/addMedic', methods=['POST'])
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
