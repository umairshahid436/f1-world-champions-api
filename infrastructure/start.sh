#!/bin/bash
set -e

echo "Starting F1 World Champions Infrastructure..."

# Check if .env file exists
if [ ! -f ../.env ]; then
    echo ".env file not found in parent directory!"
    echo "Please create ../.env file with required environment variables."
    echo "See README.md for required variables."
    exit 1
fi

echo "Environment file found"

# Start the infrastructure
echo "Starting Docker containers..."
docker-compose --env-file ../.env up -d --build

echo "Waiting for containers to be ready..."
sleep 5

# Check container status
echo "Container Status:"
docker-compose --env-file ../.env ps

echo ""
echo "Infrastructure started successfully!"
echo ""
echo "   Available services:"
echo "   • API: http://localhost:3000"
echo "   • Health: http://localhost:3000/api/health"
echo "   • Champions: http://localhost:3000/api/seasons/champions?fromYear=2020&toYear=2023"
echo ""
echo "   Management commands:"
echo "   • Stop: docker-compose --env-file ../.env down"
echo "   • Logs: docker-compose --env-file ../.env logs -f"
echo "   • Status: docker-compose --env-file ../.env ps" 