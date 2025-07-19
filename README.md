# Helicopter Route Planner

This repository contains a simple Flask application for planning helicopter routes.

## Installing Dependencies

### Using pip

1. (Optional) create and activate a virtual environment.
2. Install the Python packages:

```bash
pip install -r myapp/requirements.txt
```

### Using Docker

Build an image using the provided `Dockerfile.txt`:

```bash
docker build -t helicopter-app -f myapp/Dockerfile.txt ./myapp
```

## Configuration

The application can be configured through two environment variables:

- `DATA_FILE` – path to the JSON file used to store data (defaults to `myapp/data.json`).
- `PORT` – port where the Flask server listens (defaults to `8080`).

Set these variables before running the app directly or pass them when starting a Docker container.

## Running the Application

### Locally with Python

```bash
export DATA_FILE=/path/to/data.json  # optional
export PORT=8080                     # optional
python myapp/app.py
```

### With Docker

```bash
docker run --rm -p 8080:8080 \
  -e DATA_FILE=/app/data.json \
  -e PORT=8080 \
  helicopter-app
```

## Accessing the Application

Open `http://localhost:PORT/` in your browser. The management interface is available at `http://localhost:PORT/manage`.
