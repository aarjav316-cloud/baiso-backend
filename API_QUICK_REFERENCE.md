# API Quick Reference Card

## 🏠 System APIs

### API Info

```http
GET /
```

### Health Check

```http
GET /health
```

---

## 🔐 Authentication APIs

### Request OTP

```http
POST /api/users/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

### Login/Register

```http
POST /api/users/auth
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "name": "John Doe",    // Required for new users
  "city": "Mumbai"       // Required for new users
}
```

---

## 👨‍🍳 Chef APIs (New!)

### Get All Chefs

```http
GET /api/chefs
```

### Get Chef by ID

```http
GET /api/chefs/:id
```

### Create Chef Profile

```http
POST /api/chefs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chef John",
  "phone": "9876543210",
  "location": "Mumbai",
  "cuisine": "italian",
  "price": 15000,
  "experience": 5,
  "availability": "full-time"
}
```

### Get My Chef Profile

```http
GET /api/chefs/me/profile
Authorization: Bearer <token>
```

### Update My Chef Profile

```http
PUT /api/chefs/me/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 18000,
  "location": "Delhi"
}
```

### Delete My Chef Profile

```http
DELETE /api/chefs/me/profile
Authorization: Bearer <token>
```

---

## 👤 Profile APIs (Protected)

### Get Profile

```http
GET /api/users/profile/:userId
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",    // Optional
  "city": "New City"     // Optional
}
```

### Delete Account

```http
DELETE /api/users/account
Authorization: Bearer <token>
```

---

## 📋 All Available Endpoints

| Method | Endpoint                     | Auth | Description           |
| ------ | ---------------------------- | ---- | --------------------- |
| POST   | `/api/users/request-otp`     | ❌   | Request OTP for phone |
| POST   | `/api/users/auth`            | ❌   | Login or Register     |
| GET    | `/api/users/profile/:userId` | ✅   | Get user profile      |
| PUT    | `/api/users/profile`         | ✅   | Update profile        |
| DELETE | `/api/users/account`         | ✅   | Delete account        |
| POST   | `/api/maids`                 | ❌   | Create maid listing   |
| GET    | `/api/maids`                 | ❌   | Get all maids         |
| POST   | `/api/requests`              | ✅   | Create request        |
| GET    | `/api/requests`              | ✅   | Get user requests     |

---

## 🔑 Authentication Header

All protected endpoints require:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get token from login response:

```javascript
const token = loginResponse.data.token;
localStorage.setItem("authToken", token);
```

---

## 📊 Standard Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error" // Development only
}
```

---

## 🎯 Common Status Codes

| Code | Meaning           | When                           |
| ---- | ----------------- | ------------------------------ |
| 200  | OK                | Successful GET, PUT, DELETE    |
| 201  | Created           | Successful POST (new resource) |
| 400  | Bad Request       | Invalid input/validation error |
| 401  | Unauthorized      | Missing or invalid token       |
| 403  | Forbidden         | Valid token but no permission  |
| 404  | Not Found         | Resource doesn't exist         |
| 429  | Too Many Requests | Rate limited                   |
| 500  | Server Error      | Internal server error          |

---

## 🧪 Quick Test Commands

### System Endpoints

```bash
# API Info
curl http://localhost:5000/

# Health Check
curl http://localhost:5000/health
```

### Login Flow

```bash
# 1. Request OTP
curl -X POST http://localhost:5000/api/users/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# 2. Login with OTP
curl -X POST http://localhost:5000/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456", "name": "Test", "city": "Mumbai"}'
```

### Profile Operations

```bash
# Get profile
curl -X GET http://localhost:5000/api/users/profile/<userId> \
  -H "Authorization: Bearer <token>"

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "city": "New City"}'

# Delete account
curl -X DELETE http://localhost:5000/api/users/account \
  -H "Authorization: Bearer <token>"
```

---

## 💻 Frontend Helper

```javascript
// API Base
const API_BASE = "http://localhost:5000";

// Get auth headers
const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  "Content-Type": "application/json",
});

// Request OTP
const requestOTP = async (phone) => {
  const res = await fetch(`${API_BASE}/api/users/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return await res.json();
};

// Login
const login = async (phone, otp, name, city) => {
  const res = await fetch(`${API_BASE}/api/users/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp, name, city }),
  });
  return await res.json();
};

// Get profile
const getProfile = async (userId) => {
  const res = await fetch(`${API_BASE}/api/users/profile/${userId}`, {
    headers: getHeaders(),
  });
  return await res.json();
};

// Update profile
const updateProfile = async (name, city) => {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, city }),
  });
  return await res.json();
};

// Delete account
const deleteAccount = async () => {
  const res = await fetch(`${API_BASE}/api/users/account`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await res.json();
};
```

---

## 🔒 Security Checklist

- ✅ All sensitive endpoints protected with JWT
- ✅ Password excluded from responses
- ✅ OTP hashed in Redis
- ✅ Rate limiting on OTP requests
- ✅ Input validation on all endpoints
- ✅ Proper error messages (no sensitive info leak)
- ✅ Token expiration (7 days)
- ✅ CORS enabled

---

## 📱 Mobile/Frontend Flow

### Registration Flow:

1. User enters phone → Request OTP
2. User enters OTP + name + city → Register
3. Store token and user data
4. Redirect to dashboard

### Login Flow:

1. User enters phone → Request OTP
2. User enters OTP → Login
3. Store token and user data
4. Redirect to dashboard

### Profile Update Flow:

1. User edits name/city
2. Submit update with token
3. Update local storage
4. Show success message

### Account Deletion Flow:

1. User confirms deletion
2. Send delete request with token
3. Clear local storage
4. Redirect to login

---

## 🎯 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/baiso
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

---

## 📚 Full Documentation

- **Profile APIs:** `backend/PROFILE_API_DOCS.md`
- **Testing Guide:** `backend/TEST_PROFILE_APIS.md`
- **Implementation Summary:** `PROFILE_APIS_SUMMARY.md`
- **Redis Setup:** `backend/REDIS_SETUP.md`
- **Quick Start:** `QUICK_START.md`
