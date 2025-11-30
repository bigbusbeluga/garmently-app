#!/bin/bash
# Fix migration conflicts by faking initial migrations
python manage.py migrate --fake api zero
python manage.py migrate api --fake-initial
