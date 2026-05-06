#!/bin/sh
# Use uv run to execute gunicorn within the project context
exec uv run gunicorn --bind 0.0.0.0:5003 wsgi:app \
    --keyfile /etc/letsencrypt/live/oscc.nolden.biz/privkey.pem \
    --certfile /etc/letsencrypt/live/oscc.nolden.biz/cert.pem

