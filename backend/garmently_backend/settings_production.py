"""
Production settings for Garmently app.
This file contains production-specific configurations.
"""

from .settings import *
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Add your production domain here
ALLOWED_HOSTS = [
    'your-domain.com',
    'www.your-domain.com',
    'your-app.herokuapp.com',  # If using Heroku
    'your-app.vercel.app',     # If using Vercel
    'localhost',               # For local testing
    '127.0.0.1',              # For local testing
]

# Production database - Use PostgreSQL instead of SQLite
# You'll need to set DATABASE_URL in your environment variables
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
    }
else:
    # Fallback to SQLite for local testing
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# If using HTTPS (recommended)
# SECURE_SSL_REDIRECT = True
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://www.your-frontend-domain.com",
    # Add your production frontend URLs here
]

# Remove CORS_ALLOW_ALL_ORIGINS in production
CORS_ALLOW_ALL_ORIGINS = False

# Logging configuration for production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Use a proper secret key from environment variables
SECRET_KEY = os.getenv('SECRET_KEY', 'your-production-secret-key-here')

# Production email settings (optional)
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
# EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')