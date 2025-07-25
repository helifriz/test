from werkzeug.exceptions import BadRequest


def parse_person_payload(payload):
    """Extract and validate a person payload with name and weight."""
    name = (payload.get('name') or '').strip()
    try:
        weight = float(payload.get('weight'))
    except (TypeError, ValueError):
        weight = None

    if not name or weight is None:
        raise BadRequest('Name and weight required')
    if not (0 < weight < 500):
        raise BadRequest('Weight must be between 0 and 500')

    return name, weight
