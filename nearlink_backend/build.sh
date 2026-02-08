#!/bin/bash

# 1. Install dependencies
echo "Installing dependencies..."
python3.12 -m pip install -r requirements.txt

# 2. Run Migrations to Neon
echo "Running migrations..."
python3.12 manage.py migrate --noinput

# 3. Collect Static Files
echo "Collecting static files..."
python3.12 manage.py collectstatic --noinput --clear