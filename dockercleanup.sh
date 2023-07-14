#!/bin/bash

# simple bash script to edit and test out my docker compose file to deploy containers

# Stop and remove existing containers
docker-compose down

# Build the Docker images
docker-compose build

# Start the containers
docker-compose up -d
