# Redis Integration for OTP Management

## Overview
Redis is now integrated for secure, production-ready OTP storage and management.

## Installation

### 1. Install Redis dependency
```bash
npm install redis
```

### 2. Install Redis Server

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker (Recommended for development):**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 3. Configure Environment Variables
Add to your `.env` file:
```env
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Features Implemented

### 1. OTP Storage in Redis
- OTPs are hashed using SHA-256 before storage
- Automatic expiry after 5 minutes (TTL)
- Single-use OTPs (deleted after verification)
- Key format: `otp:<phone_number>`

### 2. Rate Limiting
- Max 5 failed OTP attempts per 15 minutes
- Prevents OTP request spam (one OTP per phone until expiry)
- Automatic cooldown period

### 3. Security Features
- OTPs are hashed (not stored in plain text)
- Automatic expiration
- Single-use enforcement
- Failed attempt tracking
- Rate limiting per phone number

## API Endpoints

### Request OTP
```http
POST /api/users/request-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+1234567890",
    "expiresIn": "5 minutes",
    "otp": "123456"  // Only in development mode
  }
}
```

**Rate Limited Response:**
```json
{
  "success": false,
  "message": "OTP already sent",
  "data": {
    "retryAfter": 240  // seconds
  }
}
```

### Login/Register with OTP
```http
POST /api/users/auth
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456",
  "name": "John Doe",  // Required for new users
  "city": "New York"   // Required for new users
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "phone": "+1234567890",
      "city": "New York",
      "role": "user",
      "isPhoneVerified": true,
      "authMethod": "otp"
    }
  }
}
```

## OTP Flow

### Registration Flow (New User)
1. User requests OTP: `POST /api/users/request-otp`
2. OTP generated and stored in Redis (5 min expiry)
3. User submits OTP with name/city: `POST /api/users/auth`
4. OTP verified from Redis
5. User created in MongoDB
6. OTP deleted from Redis (single-use)
7. JWT token returned

### Login Flow (Existing User)
1. User requests OTP: `POST /api/users/request-otp`
2. OTP generated and stored in Redis
3. User submits OTP: `POST /api/users/auth`
4. OTP verified from Redis
5. OTP deleted from Redis
6. JWT token returned

## Security Best Practices

### Implemented ✅
- OTP hashing (SHA-256)
- Automatic expiration (5 minutes)
- Single-use OTPs
- Rate limiting (5 attempts per 15 min)
- Request throttling (one OTP per phone)
- OTP not exposed in production

### Recommended Additions
1. **SMS Integration** - Integrate Twilio/AWS SNS for real OTP delivery
2. **IP-based Rate Limiting** - Use express-rate-limit
3. **Phone Validation** - Validate phone format before OTP generation
4. **Logging** - Log OTP requests for audit trail
5. **Monitoring** - Monitor Redis health and OTP metrics

## Configuration Options

### OTP Settings (in `otp.service.js`)
```javascript
const OTP_EXPIRY = 5 * 60;           // 5 minutes
const MAX_OTP_ATTEMPTS = 5;          // Max failed attempts
const ATTEMPT_WINDOW = 15 * 60;      // 15 minutes cooldown
```

### Redis Connection (in `redis.js`)
```javascript
url: process.env.REDIS_URL || "redis://localhost:6379"
```

## Testing

### Test OTP Flow (Development)
```bash
# 1. Request OTP
curl -X POST http://localhost:5000/api/users/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Response includes OTP in development mode
# {"success": true, "data": {"otp": "123456"}}

# 2. Login with OTP
curl -X POST http://localhost:5000/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "otp": "123456", "name": "Test", "city": "NYC"}'
```

### Check Redis Data
```bash
# Connect to Redis CLI
redis-cli

# View all OTP keys
KEYS otp:*

# Check specific OTP
GET otp:+1234567890

# Check TTL
TTL otp:+1234567890

# View failed attempts
GET otp_attempt:+1234567890
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
REDIS_URL=redis://your-redis-host:6379
# Or for Redis Cloud/AWS ElastiCache:
REDIS_URL=rediss://username:password@host:port
```

### Redis Hosting Options
1. **AWS ElastiCache** - Managed Redis service
2. **Redis Cloud** - redis.com cloud hosting
3. **DigitalOcean Managed Redis**
4. **Heroku Redis** - Add-on for Heroku apps
5. **Self-hosted** - Docker/VM deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` (hides OTP in responses)
- [ ] Use secure Redis connection (TLS/SSL)
- [ ] Set strong JWT_SECRET
- [ ] Integrate real SMS service
- [ ] Enable Redis persistence (AOF/RDB)
- [ ] Set up Redis monitoring
- [ ] Configure Redis maxmemory policy
- [ ] Enable Redis authentication
- [ ] Set up backup strategy

## Troubleshooting

### Redis Connection Failed
```
Error: Redis Client Error: connect ECONNREFUSED
```
**Solution:** Ensure Redis server is running
```bash
# Check Redis status
redis-cli ping  # Should return "PONG"

# Start Redis
# Windows: redis-server
# macOS: brew services start redis
# Linux: sudo systemctl start redis
```

### OTP Not Found
**Possible causes:**
- OTP expired (5 min TTL)
- OTP already used (single-use)
- Redis connection lost

### Rate Limiting Issues
**Reset rate limit for testing:**
```bash
redis-cli
DEL otp_attempt:+1234567890
```

## Monitoring

### Key Metrics to Track
- OTP request rate
- OTP verification success rate
- Failed attempt rate
- Average OTP TTL usage
- Redis memory usage
- Redis connection health

### Redis Commands for Monitoring
```bash
# Memory usage
INFO memory

# Connection stats
INFO clients

# Key statistics
INFO keyspace

# Monitor real-time commands
MONITOR
```

## Migration from MongoDB OTP Storage

Your User model still has `otp` and `otpExpiry` fields. These are now unused but kept for backward compatibility. You can remove them in a future migration:

```javascript
// Optional: Remove unused fields from User model
// otp: { type: String, select: false },
// otpExpiry: { type: Date, select: false },
```

## Support

For issues or questions:
1. Check Redis connection: `redis-cli ping`
2. Check logs: `console.log` statements in development
3. Verify environment variables are set
4. Test with development mode first (OTP visible in response)
