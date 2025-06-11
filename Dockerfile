FROM node:18-slim

# Install Python and required system dependencies for OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    libgtk-3-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libatlas-base-dev \
    gfortran \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package.json and install Node.js dependencies
COPY backend/package.json ./
RUN npm install

# Create Python virtual environment
RUN python3 -m venv /opt/venv

# Activate virtual environment and install Python dependencies
COPY backend/requirements.txt ./
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Set environment variables
ENV PYTHONPATH="/app"
ENV PATH="/opt/venv/bin:$PATH"

# Start the application
CMD ["node", "index.js"]