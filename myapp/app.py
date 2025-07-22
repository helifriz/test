from flask import Flask, render_template, jsonify
import os

# Support running as part of the ``myapp`` package or as standalone files.
try:  # Package-style imports
    from .data_utils import load_data
    from .pilot import pilot_bp
    from .medic import medic_bp
    from .waypoint import waypoint_bp
except ImportError:  # Fallback when executed as standalone scripts
    from data_utils import load_data
    from pilot import pilot_bp
    from medic import medic_bp
    from waypoint import waypoint_bp

app = Flask(__name__)

# Server configuration
PORT = int(os.environ.get('PORT', '8080'))
DEBUG = os.environ.get('DEBUG', 'False').lower() in (
    '1', 'true', 't', 'yes', 'on'
)

# Register route blueprints
app.register_blueprint(pilot_bp)
app.register_blueprint(medic_bp)
app.register_blueprint(waypoint_bp)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/manage')
def manage():
    return render_template('manage.html')


@app.route('/data')
def get_data():
    """Return the full data set as JSON."""
    return jsonify(load_data())


@app.route('/clearCache', methods=['POST'])
def clear_cache():
    """Clear cached templates to force fresh rendering."""
    app.jinja_env.cache.clear()
    return jsonify({'status': 'cache cleared'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
