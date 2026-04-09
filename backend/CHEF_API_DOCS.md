# Chef Provider API Documentation

## ✅ Overview

The Chef Provider system allows authenticated users to create and manage chef profiles. It follows the same pattern as the Maid system and integrates seamlessly with the existing authentication.

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

1. `GET /api/chefs` - Get all chefs with filters
2. `GET /api/chefs/:id` - Get chef by ID

### Protected Endpoints (Authentication Required)

3. `POST /api/chefs` - Create chef profile
4. `GET /api/chefs/me/profile` - Get my chef profile
5. `PUT /api/chefs/me/profile` - Update my chef profile
6. `DELETE /api/chefs/me/profile` - Delete my chef profile

---

## 🔓 Public Endpoints

### 1. Get All Chefs

**Endpoint:** `GET /api/chefs`

**Description:** Fetch all chefs with optional filters

**Query Parameters:**

- `location` (string, optional) - Filter by location (case-insensitive partial match)
- `cuisine` (string, optional) - Filter by cuisine type
  - Values: `indian`, `chinese`, `italian`, `continental`, `multi-cuisine`
- `availability` (string, optional) - Filter by availability
  - Values: `morning`, `evening`, `both`, `full-time`
- `minPrice` (number, optional) - Minimum price filter
- `maxPrice` (number, optional) - Maximum price filter

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chefs fetched successfully",
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "phone": "+919876543210",
        "city": "Mumbai"
      },
      "name": "Chef John",
      "phone": "9876543210",
      "location": "Mumbai",
      "cuisine": "italian",
      "price": 15000,
      "experience": 5,
      "availability": "full-time",
      "createdAt": "2026-04-09T10:00:00.000Z",
      "updatedAt": "2026-04-09T10:00:00.000Z"
    }
  ]
}
```

**Example Requests:**

```bash
# Get all chefs
curl http://localhost:5000/api/chefs

# Filter by location
curl "http://localhost:5000/api/chefs?location=Mumbai"

# Filter by cuisine
curl "http://localhost:5000/api/chefs?cuisine=italian"

# Filter by price range
curl "http://localhost:5000/api/chefs?minPrice=10000&maxPrice=20000"

# Multiple filters
curl "http://localhost:5000/api/chefs?location=Mumbai&cuisine=indian&availability=full-time"
```

---

### 2. Get Chef by ID

**Endpoint:** `GET /api/chefs/:id`

**Description:** Fetch a specific chef by ID

**URL Parameters:**

- `id` (string, required) - Chef ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chef fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "phone": "+919876543210",
      "city": "Mumbai"
    },
    "name": "Chef John",
    "phone": "9876543210",
    "location": "Mumbai",
    "cuisine": "italian",
    "price": 15000,
    "experience": 5,
    "availability": "full-time",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Chef not found"
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/chefs/507f1f77bcf86cd799439011
```

---

## 🔐 Protected Endpoints

### 3. Create Chef Profile

**Endpoint:** `POST /api/chefs`

**Description:** Create a chef profile for the authenticated user

**Authentication:** Required (JWT token)

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
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

**Body Parameters:**

- `name` (string, required) - Chef's name
- `phone` (string, required) - 10-digit phone number
- `location` (string, required) - Chef's location
- `cuisine` (string, required) - Cuisine type
  - Values: `indian`, `chinese`, `italian`, `continental`, `multi-cuisine`
- `price` (number, required) - Monthly price (must be >= 0)
- `experience` (number, required) - Years of experience (must be >= 0)
- `availability` (string, required) - Availability
  - Values: `morning`, `evening`, `both`, `full-time`

**Success Response (201):**

```json
{
  "success": true,
  "message": "Chef profile created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "name": "Chef John",
    "phone": "9876543210",
    "location": "Mumbai",
    "cuisine": "italian",
    "price": 15000,
    "experience": 5,
    "availability": "full-time",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Missing Fields:**

```json
{
  "success": false,
  "message": "All fields are required"
}
```

**400 - Already Has Profile:**

```json
{
  "success": false,
  "message": "You already have a chef profile"
}
```

**400 - Validation Error:**

```json
{
  "success": false,
  "message": "Phone number must be 10 digits"
}
```

**401 - Unauthorized:**

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:5000/api/chefs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef John",
    "phone": "9876543210",
    "location": "Mumbai",
    "cuisine": "italian",
    "price": 15000,
    "experience": 5,
    "availability": "full-time"
  }'
```

**Important Notes:**

- User's role is automatically updated to "provider" upon chef profile creation
- Each user can only have ONE chef profile
- The authenticated user's ID is automatically attached as `userId`

---

### 4. Get My Chef Profile

**Endpoint:** `GET /api/chefs/me/profile`

**Description:** Get the authenticated user's chef profile

**Authentication:** Required (JWT token)

**Headers:**

```http
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chef profile fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "phone": "+919876543210",
      "city": "Mumbai"
    },
    "name": "Chef John",
    "phone": "9876543210",
    "location": "Mumbai",
    "cuisine": "italian",
    "price": 15000,
    "experience": 5,
    "availability": "full-time",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "You don't have a chef profile yet"
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer <token>"
```

---

### 5. Update Chef Profile

**Endpoint:** `PUT /api/chefs/me/profile`

**Description:** Update the authenticated user's chef profile

**Authentication:** Required (JWT token)

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Chef John Updated",
  "location": "Delhi",
  "price": 18000,
  "cuisine": "multi-cuisine"
}
```

**Body Parameters (all optional):**

- `name` (string) - Chef's name
- `phone` (string) - 10-digit phone number
- `location` (string) - Chef's location
- `cuisine` (string) - Cuisine type
- `price` (number) - Monthly price
- `experience` (number) - Years of experience
- `availability` (string) - Availability

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chef profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "phone": "+919876543210",
      "city": "Mumbai"
    },
    "name": "Chef John Updated",
    "phone": "9876543210",
    "location": "Delhi",
    "cuisine": "multi-cuisine",
    "price": 18000,
    "experience": 5,
    "availability": "full-time",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T11:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Chef profile not found"
}
```

**Example Request:**

```bash
curl -X PUT http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 18000,
    "location": "Delhi"
  }'
```

---

### 6. Delete Chef Profile

**Endpoint:** `DELETE /api/chefs/me/profile`

**Description:** Delete the authenticated user's chef profile

**Authentication:** Required (JWT token)

**Headers:**

```http
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Chef profile deleted successfully",
  "data": {
    "deletedChef": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Chef John"
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Chef profile not found"
}
```

**Example Request:**

```bash
curl -X DELETE http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer <token>"
```

**Important Notes:**

- User's role is automatically updated back to "user" after deletion
- This action is permanent and cannot be undone

---

## 🔄 Complete User Flow

### Becoming a Chef Provider:

**1. User registers/logs in:**

```bash
POST /api/users/auth
{
  "phone": "+919876543210",
  "otp": "123456",
  "name": "John Doe",
  "city": "Mumbai"
}
```

**2. User creates chef profile:**

```bash
POST /api/chefs
Authorization: Bearer <token>
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

**3. User's role automatically becomes "provider"**

**4. User can view their profile:**

```bash
GET /api/chefs/me/profile
Authorization: Bearer <token>
```

**5. User can update their profile:**

```bash
PUT /api/chefs/me/profile
Authorization: Bearer <token>
{
  "price": 18000
}
```

**6. User can delete their profile:**

```bash
DELETE /api/chefs/me/profile
Authorization: Bearer <token>
```

---

## 📊 Data Model

### Chef Schema:

```javascript
{
  userId: ObjectId (ref: User) - Owner of the profile
  name: String - Chef's name
  phone: String - 10-digit phone number
  location: String - Chef's location
  cuisine: String - Cuisine type (enum)
  price: Number - Monthly price (>= 0)
  experience: Number - Years of experience (>= 0)
  availability: String - Availability (enum)
  createdAt: Date - Creation timestamp
  updatedAt: Date - Last update timestamp
}
```

### Cuisine Types:

- `indian` - Indian cuisine
- `chinese` - Chinese cuisine
- `italian` - Italian cuisine
- `continental` - Continental cuisine
- `multi-cuisine` - Multiple cuisines

### Availability Options:

- `morning` - Morning shift
- `evening` - Evening shift
- `both` - Both shifts
- `full-time` - Full-time availability

---

## 🔒 Security Features

### Authentication:

- All write operations (create, update, delete) require JWT authentication
- User can only manage their own chef profile
- User ID is automatically attached from `req.user`

### Validation:

- All required fields validated
- Phone number must be exactly 10 digits
- Price and experience must be non-negative
- Cuisine and availability must be from predefined enums
- Duplicate chef profiles prevented (one per user)

### Role Management:

- User role automatically updated to "provider" on chef creation
- Role reverted to "user" on chef profile deletion
- Existing authentication system not affected

---

## 🧪 Testing

### Test Complete Flow:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}' \
  | jq -r '.data.token')

# 2. Create chef profile
curl -X POST http://localhost:5000/api/chefs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chef John",
    "phone": "9876543210",
    "location": "Mumbai",
    "cuisine": "italian",
    "price": 15000,
    "experience": 5,
    "availability": "full-time"
  }'

# 3. Get my profile
curl http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Update profile
curl -X PUT http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 18000}'

# 5. Get all chefs (public)
curl http://localhost:5000/api/chefs

# 6. Delete profile
curl -X DELETE http://localhost:5000/api/chefs/me/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Summary

The Chef Provider system:

✅ Follows the same pattern as Maid system
✅ Fully integrated with existing authentication
✅ Automatic role management (user → provider)
✅ One chef profile per user
✅ Complete CRUD operations
✅ Public listing with filters
✅ Protected profile management
✅ Consistent response format
✅ Comprehensive validation
✅ Production-ready

All endpoints are ready to use and fully integrated with your existing backend!
