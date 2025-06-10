#!/bin/bash
set -e

echo "Stopping F1 World Champions Infrastructure..."

# Stop containers
docker-compose --env-file ../.env down

echo "Infrastructure stopped successfully!"

# Option to remove volumes
read -p "Do you want to remove database volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Removing volumes..."
    docker-compose --env-file ../.env down -v
    echo "Volumes removed!"
else
    echo "Database volumes preserved"
fi 