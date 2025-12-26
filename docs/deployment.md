# Deployment Guide

## Local Development

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend (Optional)

```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Production Build

### Frontend Build

```bash
cd src/frontend
npm run build
```

This creates a `dist` folder with optimized static files.

### Serving the Build

#### Option 1: Using Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option 2: Using Vite Preview

```bash
npm run preview
```

#### Option 3: Using Docker

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t archflow-frontend .
docker run -p 80:80 archflow-frontend
```

## Backend Deployment

### Using Uvicorn (Production)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t archflow-backend .
docker run -p 8000:8000 archflow-backend
```

### Docker Compose

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  frontend:
    build: ./src/frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./src/backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
```

Run:

```bash
docker-compose up -d
```

## Environment Variables

### Frontend

Create `.env` file in `src/frontend`:

```env
VITE_API_URL=http://localhost:8000
```

### Backend

Create `.env` file in `src/backend`:

```env
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
DATA_DIR=/app/data
```

## Cloud Deployment Options

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `src/frontend`
3. Vercel will auto-detect Vite and configure accordingly

### Railway/Render (Backend)

1. Create a new web service
2. Set the root directory to `src/backend`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### AWS/GCP/Azure

Use the Docker containers with your preferred container orchestration service (ECS, Cloud Run, AKS, etc.)
