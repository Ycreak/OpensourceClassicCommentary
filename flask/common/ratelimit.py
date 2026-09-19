"""
Central rate limiter for the Flask API.

Configured through environment variables:
    RATE_LIMIT_STORAGE  Storage backend (default: memory://, per worker).
                        Use a shared backend (e.g. redis://...) when running
                        multiple gunicorn workers, otherwise limits are
                        enforced per worker process.
    RATE_LIMIT_LOGIN    Per-IP limit for the /user/login endpoint
                        (default: 10 per minute).
"""

import os

from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv(".env")

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("RATE_LIMIT_STORAGE", "memory://"),
)
