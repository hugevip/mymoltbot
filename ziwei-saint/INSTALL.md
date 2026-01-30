# Ziwei Saint 1.0 - Installation Guide

## Quick Start

To deploy Ziwei Saint 1.0, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/hugevip/mymoltbot.git
cd mymoltbot/ziwei-saint
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the application
```bash
npm start
```

Or using ts-node directly:
```bash
npx ts-node quick-start.ts
```

## Docker Deployment

### 1. Build the Docker image
```bash
docker build -t ziwei-saint:1.0 .
```

### 2. Run the container
```bash
docker run -p 3001:3001 ziwei-saint:1.0
```

## Configuration

The system can be configured via environment variables:

- `PORT` - Port to run the service on (default: 3001)
- `NODE_ENV` - Environment mode (default: development)

## API Endpoints

Once deployed, the following endpoints are available:

- `GET /health` - System health check
- `GET /api/discover` - Node discovery
- `POST /api/task` - Execute system tasks

## WebSocket Interface

Connect to `ws://[host]:[port]` for real-time communication with the system.

## Production Deployment

For production deployments, consider:

1. Using a process manager like PM2:
```bash
npm install -g pm2
pm2 start quick-start.ts --name "ziwei-saint"
```

2. Setting up a reverse proxy with nginx
3. Configuring SSL certificates
4. Setting up monitoring and logging