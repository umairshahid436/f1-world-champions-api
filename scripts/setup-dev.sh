#!/bin/bash
set -e

echo "Setting up F1 World Champions API Development Environment..."
echo "=================================================="

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Check if Node.js and npm are installed
echo "📦 Checking Node.js and npm..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm and try again."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Node.js $NODE_VERSION found"

# Step 2: Check if Docker is installed
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "Docker and Docker Compose found"

# Step 3: Install dependencies
echo "Installing npm dependencies..."
npm install

# Step 4: Setup environment files
echo "Setting up environment files..."

if [ ! -f ".env" ]; then
    if [ -f ".env" ]; then
        cp .env .env
        echo "created .env"
    else
        echo ".env.example not found"
        exit 1
    fi
else
    echo " .env already exists, skipping..."
fi



# Step 5: Start database
echo "Starting PostgreSQL database..."
cd infrastructure
docker-compose --env-file ../.env up -d postgres

echo "Waiting for database to be ready..."
sleep 5

# Check if database is healthy
if docker-compose --env-file ../.env ps postgres | grep -q "healthy"; then
    echo "Database is ready!"
else
    echo "Database might still be starting up. Check with: docker-compose ps"
fi

cd ..

echo ""
echo " Setup completed successfully!"
echo "=================================================="
echo ""
echo " Next steps:"
echo "   1. Start the API: npm start"
echo "   2. Open your browser: http://localhost:3000/api/health"
echo "   3. Test champions endpoint: http://localhost:3000/api/seasons/champions?fromYear=2020&toYear=2023"
echo ""
echo " Useful commands:"
echo "   • Start API locally: npm start"
echo "   • Start full stack: cd infrastructure && ./start.sh"
echo "   • Stop containers: cd infrastructure && ./stop.sh"
echo "   • View logs: cd infrastructure && docker-compose --env-file ../.env logs -f"
echo "" 