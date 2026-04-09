# Redis OTP Integration - Implementation Summary

## ✅ What Was Done

### 1. Files Created
- `src/configs/redis.js` - Redis connection management
- `src/services/otp.service.js` - OTP operations (generate, store, verify, rate limiting)
- `.env.example` - Environment variable template
- `REDIS_SETUP.md` - Complete Redis setup and usage guide

### 2. Files Modified
- `index.js` - Added Redis initialization
- `src/controllers/user.controller.js` - Updated to use Redis for OTP
- `package.json` - Added redis dependency

### 3. Key Features Implemented

#### OTP Security
- ✅ 6-digit OTP generation
- ✅ SHA-256 hashing (OTPs stored hashed, not plain text)
- ✅ 5-minute automatic expiration (TTL)
- ✅ Single-use enforcement (deleted after verification)
- ✅ OTP hidden in production (only visible in development)

#### Rate Limiting
- ✅ Max 5 failed OTP attempts per 15 minutes
- ✅ One OTP request per phone until expiry
- ✅ Automatic cooldown period
- ✅ Retry-after information in responses

#### Production Ready
- ✅ Graceful Redis connection handling
- ✅ Reconnection strategy with exponential backoff
- ✅ Error handling for Redis unavailability
- ✅ Environment-based configuration
- ✅ Consistent response format

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Redis (Choose one)
```bash
# Docker (Recommended)
docker run -d -p 6379:6379 --name redis redis:alpine

# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

### Configure Environment
Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/your-db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### Start Server
```bash
npm run dev
```

## 📡 API Usage

### 1. Request OTP
```bash
POST /api/users/request-otp
{
  "phone": "+1234567890"
}
```

### 2. Login/Register with OTP
```bash
POST /api/users/auth
{
  "phone": "+1234567890",
  "otp": "123456",
  "name": "John Doe",    # For new users
  "city": "New York"     # For new users
}
```

### 3. Login with Password (Still Works)
```bash
POST /api/users/auth
{
  "phone": "+1234567890",
  "password": "mypassword"
}
```

## 🔒 Security Features

### OTP Storage
- Stored in Redis with key: `otp:<phone>`
- Hashed using SHA-256
- Auto-expires in 5 minutes
- Deleted immediately after use

### Rate Limiting
- Failed attempts tracked: `otp_attempt:<phone>`
- Max 5 attempts per 15 minutes
- Prevents brute force attacks
- Prevents OTP spam

### Production Safety
- OTP never exposed in production responses
- Only visible in development mode
- Secure Redis connection support (TLS)
- Graceful degradation if Redis unavailable

## 🎯 Response Format

All responses follow consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "data": { ... }
}
```

## 🔄 OTP Flow

### New User Registration
1. Request OTP → Stored in Redis (5 min)
2. Submit OTP + name + city → Verified from Redis
3. User created in MongoDB
4. OTP deleted from Redis
5. JWT token returned

### Existing User Login
1. Request OTP → Stored in Redis (5 min)
2. Submit OTP → Verified from Redis
3. OTP deleted from Redis
4. JWT token returned

## 🛠️ Configuration

### OTP Settings (otp.service.js)
```javascript
OTP_EXPIRY = 5 * 60          // 5 minutes
MAX_OTP_ATTEMPTS = 5         // Max failed attempts
ATTEMPT_WINDOW = 15 * 60     // 15 minutes cooldown
```

### Customize as needed:
- Change OTP length (currently 6 digits)
- Adjust expiry time
- Modify rate limits
- Add IP-based limiting

## 📊 Testing

### Development Mode
OTP is visible in response:
```json
{
  "success": true,
  "data": {
    "phone": "+1234567890",
    "otp": "123456"  // Only in development
  }
}
```

### Production Mode
OTP is hidden:
```json
{
  "success": true,
  "data": {
    "phone": "+1234567890",
    "expiresIn": "5 minutes"
  }
}
```

## 🚨 Important Notes

### Backward Compatibility
- ✅ Existing auth middleware unchanged
- ✅ Password-based auth still works
- ✅ JWT token format unchanged
- ✅ User model compatible

### User Model
- `otp` and `otpExpiry` fields now unused (kept for compatibility)
- Can be removed in future migration
- All OTP data now in Redis

### Next Steps (Recommended)
1. Integrate SMS service (Twilio/AWS SNS) for real OTP delivery
2. Add phone number validation
3. Implement IP-based rate limiting
4. Set up Redis monitoring
5. Configure Redis persistence for production

## 📚 Documentation

- Full setup guide: `REDIS_SETUP.md`
- Environment template: `.env.example`
- Code comments in all new files

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping  # Should return "PONG"
```

### OTP Not Working
1. Check Redis connection
2. Verify environment variables
3. Check OTP hasn't expired (5 min)
4. Ensure OTP wasn't already used

### Rate Limiting Issues
```bash
# Reset for testing
redis-cli
DEL otp_attempt:+1234567890
```

## ✨ Best Practices Implemented

1. **Security First**
   - OTP hashing
   - Rate limiting
   - Single-use enforcement
   - Automatic expiration

2. **Production Ready**
   - Environment-based config
   - Error handling
   - Graceful degradation
   - Reconnection strategy

3. **Clean Code**
   - Service layer separation
   - Consistent response format
   - Comprehensive error messages
   - Well-documented

4. **Scalability**
   - Redis for fast access
   - Stateless authentication
   - Horizontal scaling ready
   - Cloud-ready configuration

## 🎉 Summary

Your backend now has production-ready OTP authentication with:
- Secure Redis storage
- Rate limiting
- Single-use OTPs
- Automatic expiration
- Clean API design
- Backward compatibility

No breaking changes to existing functionality!
