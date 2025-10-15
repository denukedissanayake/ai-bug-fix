#!/bin/bash

echo "🔥 Vulnerable React Application Setup 🔥"
echo "========================================"
echo ""
echo "⚠️  WARNING: This application contains intentional security vulnerabilities!"
echo "⚠️  FOR EDUCATIONAL PURPOSES ONLY - DO NOT DEPLOY TO PRODUCTION!"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Setup complete! Here's how to run the application:"
echo ""
echo "1. Start the backend server:"
echo "   npm run server"
echo ""
echo "2. In a new terminal, start the React app:"
echo "   npm start"
echo ""
echo "3. Open your browser and navigate to:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo ""
echo "📚 Test Credentials:"
echo "   Admin: admin / admin123"
echo "   User: user / password"
echo "   Test: test / 123456"
echo ""
echo "🛡️  Security Vulnerabilities Included:"
echo "   - SQL Injection"
echo "   - Cross-Site Scripting (XSS)"
echo "   - Insecure Authentication"
echo "   - Broken Access Control"
echo "   - Command Injection"
echo "   - Insecure File Upload"
echo "   - And many more..."
echo ""
echo "📖 Read the README.md for detailed vulnerability descriptions"
echo ""
echo "⚠️  Remember: This is for educational purposes only!"