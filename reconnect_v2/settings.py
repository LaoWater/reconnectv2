"""
Django settings for reconnect_v2 Project.
"""
import os
from pathlib import Path
import environ


#####################
## Security Setup ###
#####################

# CSRF Setup
CSRF_TRUSTED_ORIGINS = [
    'https://reconnectv2.com',
    'https://www.reconnectv2.com',
    'http://192.168.0.196:8000',
    'http://127.0.0.1:8000/',

]

# Secure cookies
CSRF_COOKIE_SECURE = False  # Ensures CSRF cookies are sent only over HTTPS - use True for Production Env.
CSRF_USE_SESSIONS = False  # Or True if you want to store in session
# SESSION_COOKIE_SECURE = True

CORS_ALLOWED_ORIGINS = [
    'http://192.168.0.196:8000',
]


# SSL Certificate
# Setup & SECURE_SSL_REDIRECT is not essential for HTTPS enforcement—App Engine is already doing this in context of GC.
# Enforce HTTPS in Django
# SECURE_SSL_REDIRECT = True

# Enable HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = 3600  # Adjust to a higher value once you're sure it's safe
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True


############################
### Environments & Paths ###
############################


# Initialize environment variables
env = environ.Env()
# Explicitly load the .env file
env.read_env('.env')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "landing_page/static"),  # Path to the correct static folder
]
STATIC_ROOT = BASE_DIR / 'staticfiles'


STATIC_URL = '/static/'  # Already present

# print(STATICFILES_DIRS)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('DJANGO_SECRET_KEY')


# SECURITY WARNING: don't run with debug turned on in production! For this project Gcloud App Engine handles it through .yaml setup.
DEBUG = True


# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.0.196', '*', '100.94.146.172']
ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'landing_page',
    'corsheaders',  # For internal dev with front-end different than back-end mobile testing
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'django.contrib.sites',

]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # For internal dev with front-end different than back-end mobile testing
    'django.middleware.security.SecurityMiddleware',  # Security & SSL
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # Removed temporary for trying downgraded version of AllAuth

]

ROOT_URLCONF = 'reconnect_v2.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                "landing_page.middleware.context_processors.react_assets",  # Add this line
            ],
        },
    },
]

WSGI_APPLICATION = 'reconnect_v2.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
#
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

#
# Use /tmp/db.sqlite3 for Google Cloud, otherwise use local tmp directory
if os.getenv('GAE_ENV', '').startswith('standard'):  # Google App Engine environment
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': '/tmp/db.sqlite3',  # Temporary writable path on Google Cloud
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            # 'NAME': os.path.join(BASE_DIR, 'tmp', 'db.sqlite3'),  # Can be used with tmp if want to keep in Architectural Sync with GC.
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),  # Local DB
        }
    }



dependencies = [
    ('admin', '0001_initial'),  # Example dependency
]

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


###################################
# User Models & Google Login Integration #
###################################

AUTH_USER_MODEL = 'landing_page.CustomUser'


SOCIALACCOUNT_ADAPTER = "allauth.socialaccount.adapter.DefaultSocialAccountAdapter"
ACCOUNT_ADAPTER = "allauth.account.adapter.DefaultAccountAdapter"

# SOCIALACCOUNT_ADAPTER = "reconnect_v2.adapters.CustomSocialAccountAdapter"
# ACCOUNT_ADAPTER = "reconnect_v2.adapters.CustomAccountAdapter"


# Google OAuth Configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        "REDIRECT_URI": "http://localhost:8000/ylf/",  # Explicitly set the redirect URI
    }
}


ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False


# The ID of the current site in the django_site table.
# Ensure this matches the site used for authentication, callbacks, and redirects.
SITE_ID = 2


AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

LOGIN_REDIRECT_URL = '/empty-close/'
LOGOUT_REDIRECT_URL = '/'


SOCIALACCOUNT_LOGIN_ON_GET = True  # Initiate the social login process as soon as the user visits the /accounts/google/login/ URL, skipping the intermediate confirmation step.




##########################
###### Debugging ########
##########################

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#         },
#         'allauth': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#         },
#     },
# }
