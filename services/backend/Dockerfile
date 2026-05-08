# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Explicitly set permissions (even though volume mounts might override this on Windows)
RUN chmod +x /app/entrypoint.sh

# Expose port 8000
EXPOSE 8000

# Use 'bash' to run the script explicitly to bypass 'permission denied' issues 
# often caused by host volume mount permission mismatches.
CMD ["/bin/bash", "/app/entrypoint.sh"]
