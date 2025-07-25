from flask import Blueprint, request, jsonify, abort

try:
    from .data_utils import load_data, add_entry
except ImportError:
    from data_utils import load_data, add_entry

medic_bp = Blueprint('medic_bp', __name__)


@medic_bp.route('/addMedic', methods=['POST'])
def add_medic():
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
    if any(m.get('name', '').lower() == name.lower() for m in data.get('MEDICS', [])):
        abort(409, description='Medic already exists')

    add_entry('MEDICS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})
