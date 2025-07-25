from flask import Blueprint, request, jsonify, abort
from werkzeug.exceptions import HTTPException

try:
    from .data_utils import load_data, add_entry
    from .validators import parse_person_payload
except ImportError:
    from data_utils import load_data, add_entry
    from validators import parse_person_payload

medic_bp = Blueprint('medic_bp', __name__)


@medic_bp.route('/addMedic', methods=['POST'])
def add_medic():
    payload = request.get_json(force=True)
    try:
        name, weight = parse_person_payload(payload)
    except HTTPException as exc:
        abort(exc.code, description=exc.description)

    data = load_data()
    if any(m.get('name', '').lower() == name.lower() for m in data.get('MEDICS', [])):
        abort(409, description='Medic already exists')

    add_entry('MEDICS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})
