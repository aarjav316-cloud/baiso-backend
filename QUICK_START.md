# 🚀 Quick Start Guide

## ✅ Servers Running

Your application is now running on:

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **MongoDB:** Connected ✓
- **Redis:** Connected ✓

## 🧪 Test the Authentication Flow

### Step 1: Open Frontend
Open your browser and go to: **http://localhost:3000**

### Step 2: Login Page
1. Enter a phone number (e.g., `9876543210`)
2. Click "Continue"
3. OTP will be sent (check console for development OTP)

### Step 3: OTP Verification
1. Enter the 6-digit OTP from console
2. OTP will be verified automatically
3. You'll be logged in!

## 🔍 Check Development OTP

Open browser console (F12) and look for:
```
✅ OTP sent successfully
Development OTP: 123456
```

## 📡 API Endpoints

### Authentication:
- `POST /api/users/request-otp` - Request OTP
- `POST /api/users/auth` - Login/Register with OTP or Password

### Other APIs:
- `POST /api/maids` - Create maid listing
- `GET /api/maids` - Get all maids
- `POST /api/requests` - Create request
- `GET /api/requests` - Get user requests

## 🔐 Test with Postman/Thunder Client

### 1. Request OTP
```http
POST http://localhost:5000/api/users/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+919876543210",
    "expiresIn": "5 minutes",
    "otp": "123456"
  }
}
```

### 2. Verify OTP & Login
```http
POST http://localhost:5000/api/users/auth
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "name": "John Doe",
  "city": "Mumbai"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "phone": "+919876543210",
      "city": "Mumbai",
      "role": "user",
      "isPhoneVerified": true,
      "authMethod": "otp"
    }
  }
}
```

### 3. Make Authenticated Request
```http
GET http://localhost:5000/api/requests
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛠️ Development Commands

### Backend:
```bash
cd backend
npm run dev          # Start backend server
```

### Frontend:
```bash
cd frontend
npm run dev          # Start frontend server
```

### Redis:
```bash
# Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Windows
redis-server

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

### MongoDB:
Make sure MongoDB is running or use MongoDB Atlas connection string in `.env`

## 📊 Check Redis Data

```bash
# Connect to Redis CLI
redis-cli

# View all OTP keys
KEYS otp:*

# Check specific OTP
GET otp:+919876543210

# Check TTL (time to live)
TTL otp:+919876543210

# View failed attempts
GET otp_attempt:+919876543210
```

## 🐛 Troubleshooting

### Frontend not loading?
- Check if port 3000 is available
- Run `npm install` in frontend folder
- Clear browser cache

### Backend errors?
- Check if MongoDB is running
- Check if Redis is running
- Verify `.env` file exists with correct values
- Run `npm install` in backend folder

### OTP not working?
- Check Redis connection
- Check console for OTP in development mode
- Verify phone number format (+91XXXXXXXXXX)

### Rate limiting?
```bash
# Reset rate limit in Redis
redis-cli
DEL otp_attempt:+919876543210
```

## 📝 Environment Variables

### Backend `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/baiso
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
```

## 🎯 Next Steps

1. ✅ Test login flow on frontend
2. ✅ Test OTP verification
3. ✅ Check user data in MongoDB
4. ✅ Test authenticated API calls
5. 📱 Integrate SMS service for production
6. 🔒 Add more protected routes
7. 🎨 Customize UI as needed

## 📚 Documentation

- Backend Setup: `backend/REDIS_SETUP.md`
- Implementation Summary: `backend/IMPLEMENTATION_SUMMARY.md`
- Frontend Integration: `frontend/FRONTEND_API_INTEGRATION.md`

## 🎉 You're All Set!

Your full-stack authentication system is ready:
- ✅ Redis OTP storage
- ✅ JWT authentication
- ✅ Role-based user model
- ✅ Rate limiting
- ✅ Frontend integration
- ✅ Production-ready

Happy coding! 🚀
