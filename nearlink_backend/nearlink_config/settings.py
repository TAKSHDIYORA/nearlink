import os
from pathlib import Path
from datetime import timedelta
import dj_database_url

# 1. Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. Security Settings
# Use env var for production, fallback for local dev
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-local-fallback-key')

# Set DEBUG to False in production
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Allow Vercel domains and local dev
ALLOWED_HOSTS = ['.vercel.app', '127.0.0.1', 'localhost']

# 3. Application Definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'corsheaders',
    # Your apps
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',      # 1. MUST be absolute first
    'django.middleware.common.CommonMiddleware',   # 2. MUST be second for CORS to work with APPEND_SLASH
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'nearlink_config.urls'

# 4. Database - Neon Cloud (Production) vs SQLite (Local fallback)
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
        ssl_require=True if os.environ.get('DATABASE_URL') else False
    )
}

# 5. REST Framework & JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 6. CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://nearlink.vercel.app",
    "http://localhost:5173", # Keep local dev working
]

# 4. Allow the specific headers you are using
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# 5. Very important for JWT and Login
CORS_ALLOW_CREDENTIALS = True
# 7. Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nearlink_config.wsgi.application'

# 8. Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# 9. Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# 10. Static & Media Files (Required for Vercel)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# This allows Whitenoise to serve static files efficiently
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# 11. Custom User Model
AUTH_USER_MODEL = 'accounts.User'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'