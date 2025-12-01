"""
Production settings for Garmently app.
This file contains production-specific configurations.
Updated: December 1, 2025 - Force redeploy with CORS fixes
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
    'garmently-backend.herokuapp.com',  # Replace with your actual Heroku app name
    'your-domain.com',
    'www.your-domain.com', 
    'your-app.vercel.app',     # If using Vercel for frontend
    'localhost',               # For local testing
    '127.0.0.1',              # For local testing
    '.railway.app',           # Allow all Railway subdomains
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

# CORS settings for production - Allow Vercel frontend
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all origins for testing
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Accept additional dynamically generated preview domains (e.g. Vercel) and backend URLs.
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.railway\.app$",
]

# Allow posting from trusted origins so CSRF checks pass on authenticated endpoints.
CSRF_TRUSTED_ORIGINS = [
    "https://garmently-app.vercel.app",
    "https://garmently-app-git-main-bigbusbelugas-projects.vercel.app",
    "https://garmently-app-production.up.railway.app",
    "https://garmently-app-production.railway.app",
    "https://garmently-backend.up.railway.app",
    "https://*.vercel.app",
    "https://*.railway.app",
]

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

# Production email settings - REQUIRED for email verification
# Use custom backend to force IPv4 (fixes "Network is unreachable" on Railway)
EMAIL_BACKEND = 'garmently_backend.email_backend.EmailBackendIPv4'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_TLS = False
EMAIL_USE_SSL = True
EMAIL_TIMEOUT = 20
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER', 'noreply@garmently.com')

# Verification code expiry (in minutes)
VERIFICATION_CODE_EXPIRY = 10