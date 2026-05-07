#!/bin/bash
set -e

IMAGE_NAME="memoflash"
TAG="${1:-latest}"

echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

echo "Build complete: ${IMAGE_NAME}:${TAG}"
