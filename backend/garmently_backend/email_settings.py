# Email verification settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')  # Your Gmail address
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')  # Gmail App Password
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER')

# Verification code expiry (in minutes)
VERIFICATION_CODE_EXPIRY = 10
