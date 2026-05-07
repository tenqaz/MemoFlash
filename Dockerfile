# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Backend runtime
FROM python:3.12-slim
WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend files
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

# Copy backend source
COPY backend/ ./

# Copy frontend build
COPY --from=frontend-builder /app/client/dist ./static

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
