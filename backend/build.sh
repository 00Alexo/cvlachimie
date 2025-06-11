#!/bin/bash
# filepath: d:\Microsoft VS Code\cvlachimie\backend\build.sh

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Pre-setup EasyOCR models (opțional)
echo "🤖 Setting up ML models..."
python -c "
try:
    import easyocr
    print('📥 Pre-downloading EasyOCR models...')
    reader = easyocr.Reader(['en'], gpu=False, download_enabled=True)
    print('✅ Models downloaded successfully')
except Exception as e:
    print(f'⚠️ Could not pre-download models: {e}')
    print('📝 Models will be downloaded on first use')
"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Build completed successfully!"