# Admin System Implementation Summary

## What Was Implemented

### 1. Role-Based Middleware

**File:** `backend/src/middleware/auth.middleware.js`

Added reusable `checkRole` middleware:

```javascript
export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }
    next();
  };
};
```

**Features:**

- Reusable for any role
- Supports multiple roles
- Clean and scalable
- No duplication

### 2. Admin Controller

**File:** `backend/src/controllers/admin.controller.js`

Implemented 9 admin functions:

- `getAllUsers` - Get all users with pagination and filtering
- `getUserDetails` - Get detailed user information
- `updateUserRole` - Change user role
- `deleteUser` - Delete user account
- `getAllBookings` - Get all bookings with filters
- `deleteBooking` - Delete booking
- `getAllReviews` - Get all reviews with filters
- `deleteReview` - Delete review
- `getPlatformStats` - Get platform statistics

### 3. Admin Routes

**File:** `backend/src/routes/admin.routes.js`

Created 9 admin-only endpoints:

- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PUT /api/admin/users/:userId/role`
- `DELETE /api/admin/users/:userId`
- `GET /api/admin/bookings`
- `DELETE /api/admin/bookings/:bookingId`
- `GET /api/admin/reviews`
- `DELETE /api/admin/reviews/:reviewId`
- `GET /api/admin/stats`

All routes use: `authMiddleware, checkRole("admin")`

### 4. Route Registration

**File:** `backend/index.js`

Registered admin routes under `/api/admin` prefix

---

## Middleware Usage

### Single Role

```javascript
router.get("/admin-only", authMiddleware, checkRole("admin"), handler);
```

### Multiple Roles

```javascript
router.get(
  "/admin-or-provider",
  authMiddleware,
  checkRole("admin", "provider"),
  handler,
);
```

### No Role Check (Any Authenticated User)

```javascript
router.get("/profile", authMiddleware, handler);
```

---

## API Endpoints

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/api/admin/users`               | Get all users (paginated)    |
| GET    | `/api/admin/users/:userId`       | Get user details             |
| PUT    | `/api/admin/users/:userId/role`  | Update user role             |
| DELETE | `/api/admin/users/:userId`       | Delete user                  |
| GET    | `/api/admin/bookings`            | Get all bookings (paginated) |
| DELETE | `/api/admin/bookings/:bookingId` | Delete booking               |
| GET    | `/api/admin/reviews`             | Get all reviews (paginated)  |
| DELETE | `/api/admin/reviews/:reviewId`   | Delete review                |
| GET    | `/api/admin/stats`               | Get platform statistics      |

---

## Key Features

✓ **Reusable Middleware**: `checkRole` can be used throughout the application
✓ **Multiple Role Support**: Can check for multiple roles in one middleware
✓ **No Duplication**: Single middleware for all role-based authorization
✓ **Scalable**: Easy to add new roles or endpoints
✓ **Secure**: All admin routes protected by authentication and authorization
✓ **Pagination**: List endpoints support pagination
✓ **Filtering**: Support for filtering by status, type, role
✓ **Search**: User search by name, phone, or city
✓ **Statistics**: Real-time platform statistics

---

## Middleware Chain

```
Request → authMiddleware → checkRole("admin") → Controller → Response
```

1. **authMiddleware**: Verifies JWT token, attaches user to req.user
2. **checkRole("admin")**: Checks if req.user.role === "admin"
3. **Controller**: Executes admin logic
4. **Response**: Returns data or error

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Authorization**: Only admin users can access
3. **Reusable Middleware**: No code duplication
4. **Multiple Role Support**: Flexible authorization
5. **Sensitive Data Protection**: Passwords and OTPs excluded

---

## User Management

### Get All Users

- Pagination support
- Filter by role
- Search by name, phone, city
- Returns user count and pages

### Get User Details

- Full user information
- User statistics (bookings, reviews)

### Update User Role

- Change user role to: user, provider, admin
- Validation included

### Delete User

- Remove user account
- Optional: Delete related data

---

## Booking Management

### Get All Bookings

- Pagination support
- Filter by status
- Filter by type
- Populated user and provider details

### Delete Booking

- Remove booking by ID

---

## Review Management

### Get All Reviews

- Pagination support
- Filter by type
- Populated user details

### Delete Review

- Remove review by ID

---

## Platform Statistics

### Get Platform Stats

- Total users, providers, bookings, reviews
- Service breakdown by type
- Bookings by status
- Recent signups (last 7 days)
- Real-time data using aggregation

---

## Testing

See `TEST_ADMIN_APIS.md` for:

- Complete API documentation
- Request/response examples
- cURL commands
- Middleware usage examples
- Testing workflow
- Error responses

---

## Example Usage

### Admin Dashboard

```javascript
// Get platform statistics
const stats = await fetch("/api/admin/stats", {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// Display stats
console.log("Total Users:", stats.data.users.total);
console.log("Total Bookings:", stats.data.bookings.total);
```

### User Management

```javascript
// Get all users
const users = await fetch("/api/admin/users?page=1&limit=20", {
  headers: { Authorization: `Bearer ${adminToken}` },
});

// Update user role
await fetch(`/api/admin/users/${userId}/role`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ role: "provider" }),
});
```

---

## Extending the System

### Add New Admin Endpoint

```javascript
// In admin.controller.js
export const newAdminFunction = async (req, res) => {
  // Admin logic here
};

// In admin.routes.js
router.get(
  "/new-endpoint",
  authMiddleware,
  checkRole("admin"),
  newAdminFunction,
);
```

### Add Provider-Only Endpoint

```javascript
// In provider.routes.js
router.get(
  "/dashboard",
  authMiddleware,
  checkRole("provider"),
  getProviderDashboard,
);
```

### Add Multi-Role Endpoint

```javascript
// Accessible by both admin and provider
router.get(
  "/analytics",
  authMiddleware,
  checkRole("admin", "provider"),
  getAnalytics,
);
```

---

## Response Format

All endpoints follow consistent format:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {
    // Response data
  }
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Required role: admin"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## File Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── auth.middleware.js       # Added checkRole middleware
│   ├── controllers/
│   │   └── admin.controller.js      # Admin controllers
│   └── routes/
│       └── admin.routes.js          # Admin routes
└── index.js                         # Updated with admin routes
```

---

## Quick Commands

```bash
# Get all users
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update user role
curl -X PUT http://localhost:5000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"role":"provider"}'

# Get platform stats
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Delete booking
curl -X DELETE http://localhost:5000/api/admin/bookings/BOOKING_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Next Steps

1. ✓ Start server
2. ✓ Test admin endpoints
3. → Create admin user in database
4. → Build admin dashboard UI
5. → Optional enhancements:
   - Add activity logs
   - Add bulk operations
   - Add export functionality
   - Add email notifications
   - Add soft delete with restore
   - Add user suspension/ban
   - Add content moderation

---

## Notes

- **Reusable Middleware**: `checkRole` can be used for any role-based authorization
- **No Duplication**: Single middleware for all role checks
- **Scalable**: Easy to add new roles or endpoints
- **Multiple Roles**: Middleware supports checking multiple roles
- **Admin Only**: All endpoints require admin role
- **Pagination**: List endpoints support pagination
- **Filtering**: Support for various filters
- **Statistics**: Real-time platform statistics
- **Secure**: All routes protected by authentication and authorization
