# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for Firebase credentials
RUN mkdir -p /app/credentials

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_DEBUG=False
ENV FLASK_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/')" || exit 1

# Run with gunicorn
CMD exec gunicorn --bind :$PORT --workers 3 --threads 2 --timeout 60 app:app
