from flask import Blueprint, request, jsonify, abort
from werkzeug.exceptions import HTTPException

try:
    from .validators import parse_person_payload
except ImportError:  # Allow running as standalone module
    from validators import parse_person_payload

try:
    from .data_utils import load_data, add_entry
except ImportError:  # Allow running as standalone module
    from data_utils import load_data, add_entry

pilot_bp = Blueprint('pilot_bp', __name__)


@pilot_bp.route('/addPilot', methods=['POST'])
def add_pilot():
    payload = request.get_json(force=True)
    try:
        name, weight = parse_person_payload(payload)
    except HTTPException as exc:
        abort(exc.code, description=exc.description)

    data = load_data()
    if any(p.get('name', '').lower() == name.lower() for p in data.get('PILOTS', [])):
        abort(409, description='Pilot already exists')

    add_entry('PILOTS', {'name': name, 'weight': weight})
    return jsonify({'status': 'ok'})
