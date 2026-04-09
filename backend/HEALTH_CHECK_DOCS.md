# Health Check & API Info Endpoints

## ✅ New Endpoints Added

Two new endpoints have been added to your backend:

1. `GET /` - API information endpoint
2. `GET /health` - Health check endpoint

Both endpoints return JSON responses with consistent formatting.

---

## 📡 API Endpoints

### 1. Root Endpoint - API Info

**Endpoint:** `GET /`

**Description:** Returns API information and available endpoints

**Authentication:** Not required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Baiso API is running",
  "data": {
    "name": "Baiso API",
    "version": "v1",
    "status": "running",
    "timestamp": "2026-04-09T10:30:00.000Z",
    "endpoints": {
      "health": "/health",
      "auth": "/api/users",
      "maids": "/api/maids",
      "requests": "/api/requests"
    }
  }
}
```

**Example Request:**

```bash
curl http://localhost:5000/
```

**Frontend Example:**

```javascript
const response = await fetch("/");
const data = await response.json();
console.log(data.data.version); // "v1"
console.log(data.data.endpoints); // Available endpoints
```

---

### 2. Health Check Endpoint

**Endpoint:** `GET /health`

**Description:** Returns server health status including uptime, database connections, and service status

**Authentication:** Not required

**Success Response (200 - Healthy):**

```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-09T10:30:00.000Z",
    "uptime": {
      "seconds": 3665,
      "formatted": "1h 1m 5s"
    },
    "services": {
      "mongodb": {
        "status": "connected",
        "connected": true
      },
      "redis": {
        "status": "connected",
        "connected": true
      }
    },
    "server": {
      "port": 5000,
      "environment": "development",
      "nodeVersion": "v22.17.0"
    }
  }
}
```

**Unhealthy Response (503 - Service Unavailable):**

```json
{
  "success": false,
  "message": "Server is unhealthy",
  "data": {
    "status": "unhealthy",
    "timestamp": "2026-04-09T10:30:00.000Z",
    "uptime": {
      "seconds": 3665,
      "formatted": "1h 1m 5s"
    },
    "services": {
      "mongodb": {
        "status": "disconnected",
        "connected": false
      },
      "redis": {
        "status": "disconnected",
        "connected": false
      }
    },
    "server": {
      "port": 5000,
      "environment": "development",
      "nodeVersion": "v22.17.0"
    }
  }
}
```

**Example Request:**

```bash
curl http://localhost:5000/health
```

**Frontend Example:**

```javascript
const response = await fetch("/health");
const data = await response.json();

if (data.success) {
  console.log("Server is healthy");
  console.log("Uptime:", data.data.uptime.formatted);
  console.log("MongoDB:", data.data.services.mongodb.status);
  console.log("Redis:", data.data.services.redis.status);
} else {
  console.error("Server is unhealthy");
}
```

---

## 🔍 Health Check Details

### Status Codes:

- **200 OK** - Server is healthy (all services connected)
- **503 Service Unavailable** - Server is unhealthy (one or more services disconnected)

### Uptime Information:

- `seconds` - Total uptime in seconds
- `formatted` - Human-readable format (e.g., "1h 30m 45s")

### Service Status:

**MongoDB:**

- `connected` - Database is connected and ready
- `connecting` - Database is connecting
- `disconnected` - Database is not connected
- `disconnecting` - Database is disconnecting

**Redis:**

- `connected` - Redis is connected and ready
- `disconnected` - Redis is not connected

### Server Information:

- `port` - Server port number
- `environment` - Current environment (development/production)
- `nodeVersion` - Node.js version

---

## 🧪 Testing

### Test Root Endpoint:

```bash
# Using curl
curl http://localhost:5000/

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/"
```

### Test Health Check:

```bash
# Using curl
curl http://localhost:5000/health

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

### Test with Browser:

1. Open http://localhost:5000/ - See API info
2. Open http://localhost:5000/health - See health status

---

## 🔄 Use Cases

### 1. Monitoring & Alerting

Use the health check endpoint for:

- Uptime monitoring (Pingdom, UptimeRobot, etc.)
- Load balancer health checks
- Container orchestration (Kubernetes, Docker Swarm)
- CI/CD pipeline health verification

**Example Monitoring Script:**

```bash
#!/bin/bash
response=$(curl -s http://localhost:5000/health)
status=$(echo $response | jq -r '.success')

if [ "$status" != "true" ]; then
  echo "Server is unhealthy!"
  # Send alert (email, Slack, etc.)
fi
```

### 2. Frontend Status Display

Show server status in your admin dashboard:

```javascript
// Check server health periodically
setInterval(async () => {
  const response = await fetch("/health");
  const data = await response.json();

  updateStatusIndicator({
    healthy: data.success,
    uptime: data.data.uptime.formatted,
    mongodb: data.data.services.mongodb.connected,
    redis: data.data.services.redis.connected,
  });
}, 30000); // Check every 30 seconds
```

### 3. API Discovery

Use the root endpoint to discover available endpoints:

```javascript
const response = await fetch("/");
const data = await response.json();
const endpoints = data.data.endpoints;

// Dynamically build API client
Object.keys(endpoints).forEach((key) => {
  console.log(`${key}: ${endpoints[key]}`);
});
```

### 4. Load Balancer Configuration

Configure your load balancer to use the health check:

**Nginx:**

```nginx
upstream backend {
  server localhost:5000;

  # Health check
  check interval=3000 rise=2 fall=3 timeout=1000 type=http;
  check_http_send "GET /health HTTP/1.0\r\n\r\n";
  check_http_expect_alive http_2xx;
}
```

**AWS ALB:**

```yaml
HealthCheck:
  Path: /health
  Protocol: HTTP
  Port: 5000
  HealthyThresholdCount: 2
  UnhealthyThresholdCount: 3
  TimeoutSeconds: 5
  IntervalSeconds: 30
```

---

## 🐳 Docker Health Check

Add to your Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
```

Or in docker-compose.yml:

```yaml
services:
  backend:
    image: baiso-backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

---

## ☸️ Kubernetes Health Check

Add to your deployment.yaml:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: baiso-backend
spec:
  template:
    spec:
      containers:
        - name: backend
          image: baiso-backend:latest
          ports:
            - containerPort: 5000
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 10
            periodSeconds: 30
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
```

---

## 📊 Response Format

Both endpoints follow the consistent response format:

```json
{
  "success": boolean,
  "message": string,
  "data": object
}
```

This matches the format used by all other APIs in your backend.

---

## 🔒 Security Considerations

### 1. Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
import rateLimit from "express-rate-limit";

const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many health check requests",
});

app.get("/health", healthLimiter, (req, res) => {
  // Health check logic
});
```

### 2. Sensitive Information

The health check endpoint does NOT expose:

- Database credentials
- API keys
- User data
- Internal IP addresses
- Detailed error messages

Only connection status and basic server info are returned.

### 3. Production Considerations

In production, you may want to:

- Add authentication for detailed health info
- Create separate `/health/detailed` endpoint for admins
- Log health check failures
- Send alerts on unhealthy status

---

## 🎯 Summary

Your backend now has:

✅ **Root Endpoint (/):**

- Returns API information
- Lists available endpoints
- Shows API version and status
- JSON response (not plain text)

✅ **Health Check (/health):**

- Returns server health status
- Includes uptime information
- Shows database connection status
- Shows Redis connection status
- Returns 200 (healthy) or 503 (unhealthy)
- Includes server environment info

✅ **Production-Ready Features:**

- Consistent JSON response format
- Proper status codes
- Detailed service status
- Uptime tracking
- Environment information
- Ready for monitoring tools
- Docker/Kubernetes compatible

Both endpoints are now production-ready and follow best practices for health checks and API information endpoints!
