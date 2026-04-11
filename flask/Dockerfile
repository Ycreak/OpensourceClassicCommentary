# --- Build Stage ---
FROM python:3.12-slim-bookworm AS builder

# Copy uv binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Point uv to a location OUTSIDE the /app directory
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV UV_COMPILE_BYTECODE=1

# Copy dependency files (relative to the ./flask context)
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# --- Run Stage ---
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the venv from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Add the venv to the PATH so 'flask' command is found automatically
ENV PATH="/opt/venv/bin:$PATH"
ENV FLASK_APP=server.py

# Copy the code (This will be overridden by the volume in dev, but is good for prod)
COPY . .

EXPOSE 5000

# We can call 'flask' directly now because it's in the PATH
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--debug"]
