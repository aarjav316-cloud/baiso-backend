# Reviews API Testing Guide

## Overview

Complete review system where users can add, update, delete, and view reviews for services, building trust in the platform.

## Base URL

```
http://localhost:5000/api/reviews
```

## Authentication

Most endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Add Review

**Endpoint:** `POST /api/reviews/add`

**Authentication:** Required

**Description:** Add a new review for a service

**Request Body:**

```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "type": "chef",
  "rating": 5,
  "comment": "Excellent chef! Very professional and food was amazing."
}
```

**Fields:**

- `itemId` (required): ID of the service being reviewed
- `type` (required): Service type - "maid", "chef", "tiffin", "hostel", "flat"
- `rating` (required): Rating from 1 to 5
- `comment` (required): Review comment (10-500 characters)

**Success Response (201):**

```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "rating": 5,
    "comment": "Excellent chef! Very professional and food was amazing.",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing required fields
- 400: Invalid type
- 400: Invalid rating (must be 1-5)
- 400: Comment too short (min 10 chars) or too long (max 500 chars)
- 400: Duplicate review (already reviewed this service)
- 404: Service not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/reviews/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "rating": 5,
    "comment": "Excellent chef! Very professional and food was amazing."
  }'
```

---

## 2. Get Reviews for a Service

**Endpoint:** `GET /api/reviews/:type/:id`

**Authentication:** Not required (public)

**Description:** Get all reviews for a specific service

**URL Parameters:**

- `type`: Service type - "maid", "chef", "tiffin", "hostel", "flat"
- `id`: Service ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439011",
        "type": "chef",
        "rating": 5,
        "comment": "Excellent chef! Very professional and food was amazing.",
        "createdAt": "2026-04-09T10:30:00.000Z",
        "updatedAt": "2026-04-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": {
          "_id": "507f1f77bcf86cd799439015",
          "name": "Jane Smith",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439011",
        "type": "chef",
        "rating": 4,
        "comment": "Good service, would recommend to others.",
        "createdAt": "2026-04-08T10:30:00.000Z",
        "updatedAt": "2026-04-08T10:30:00.000Z"
      }
    ],
    "count": 2,
    "averageRating": 4.5
  }
}
```

**Error Responses:**

- 400: Invalid type
- 404: Service not found

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/reviews/chef/507f1f77bcf86cd799439011
```

---

## 3. Update Review

**Endpoint:** `PUT /api/reviews/update/:id`

**Authentication:** Required

**Description:** Update your own review

**URL Parameters:**

- `id`: Review ID

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated my review after second experience."
}
```

**Fields:**

- `rating` (optional): New rating from 1 to 5
- `comment` (optional): New comment (10-500 characters)
- At least one field must be provided

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "city": "Mumbai"
    },
    "itemId": "507f1f77bcf86cd799439011",
    "type": "chef",
    "rating": 4,
    "comment": "Updated my review after second experience.",
    "createdAt": "2026-04-09T10:30:00.000Z",
    "updatedAt": "2026-04-09T11:00:00.000Z"
  }
}
```

**Error Responses:**

- 400: No fields provided to update
- 400: Invalid rating (must be 1-5)
- 400: Comment too short or too long
- 403: Unauthorized (can only update own reviews)
- 404: Review not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/reviews/update/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 4,
    "comment": "Updated my review after second experience."
  }'
```

---

## 4. Delete Review

**Endpoint:** `DELETE /api/reviews/delete/:id`

**Authentication:** Required

**Description:** Delete your own review

**URL Parameters:**

- `id`: Review ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "deletedReviewId": "507f1f77bcf86cd799439012"
  }
}
```

**Error Responses:**

- 403: Unauthorized (can only delete own reviews)
- 404: Review not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/reviews/delete/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Get User Reviews

**Endpoint:** `GET /api/reviews/user/:userId`

**Authentication:** Required

**Description:** Get all reviews written by a specific user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "User reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439011",
        "type": "chef",
        "rating": 5,
        "comment": "Excellent chef! Very professional and food was amazing.",
        "createdAt": "2026-04-09T10:30:00.000Z",
        "updatedAt": "2026-04-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439016",
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "John Doe",
          "city": "Mumbai"
        },
        "itemId": "507f1f77bcf86cd799439017",
        "type": "tiffin",
        "rating": 4,
        "comment": "Good tiffin service with timely delivery.",
        "createdAt": "2026-04-08T10:30:00.000Z",
        "updatedAt": "2026-04-08T10:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Error Responses:**

- 403: Unauthorized (can only access own reviews)
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/reviews/user/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Review Model Structure

```javascript
{
  userId: ObjectId,           // Who wrote the review
  itemId: ObjectId,           // Service being reviewed
  type: String,               // "maid", "chef", "tiffin", "hostel", "flat"
  rating: Number,             // 1-5
  comment: String,            // 10-500 characters
  createdAt: Date,
  updatedAt: Date
}
```

---

## Validation Rules

### Rating

- Must be a number
- Minimum: 1
- Maximum: 5
- Required for add review

### Comment

- Minimum length: 10 characters
- Maximum length: 500 characters
- Required for add review
- Trimmed automatically

### Type

- Must be one of: "maid", "chef", "tiffin", "hostel", "flat"
- Case-insensitive

### Duplicate Prevention

- Same user cannot review same service twice
- Enforced by compound unique index on (userId, itemId)

---

## Security Features

1. **Authentication Required**: Add, update, delete, and get user reviews require JWT token
2. **Ownership Validation**:
   - Users can only update/delete their own reviews
   - Users can only access their own review list
3. **Duplicate Prevention**: Compound unique index prevents duplicate reviews
4. **Service Verification**: Verifies service exists before allowing review
5. **Public Reviews**: Anyone can view service reviews (no auth required)

---

## Testing Workflow

### Step 1: Add a Review

```bash
POST /api/reviews/add
{
  "itemId": "<service_id>",
  "type": "chef",
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Step 2: View Service Reviews

```bash
GET /api/reviews/chef/<service_id>
```

### Step 3: Update Your Review

```bash
PUT /api/reviews/update/<review_id>
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Step 4: View Your Reviews

```bash
GET /api/reviews/user/<your_user_id>
```

### Step 5: Delete Your Review

```bash
DELETE /api/reviews/delete/<review_id>
```

---

## Common Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

---

## Average Rating Calculation

When fetching reviews for a service, the API automatically calculates:

- Total number of reviews
- Average rating (rounded to 1 decimal place)

Example:

```json
{
  "count": 3,
  "averageRating": 4.3
}
```

---

## Database Indexes

For optimal performance:

- `userId` (indexed)
- `itemId` (indexed)
- `type` (indexed)
- `userId + itemId` (compound unique index)
- `type + itemId` (compound index)
- `createdAt` (indexed, descending)

---

## Quick Test Commands

Replace `YOUR_JWT_TOKEN` and IDs with actual values:

```bash
# Add review
curl -X POST http://localhost:5000/api/reviews/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"itemId":"SERVICE_ID","type":"chef","rating":5,"comment":"Great service!"}'

# Get service reviews
curl -X GET http://localhost:5000/api/reviews/chef/SERVICE_ID

# Update review
curl -X PUT http://localhost:5000/api/reviews/update/REVIEW_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"rating":4,"comment":"Updated review"}'

# Delete review
curl -X DELETE http://localhost:5000/api/reviews/delete/REVIEW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user reviews
curl -X GET http://localhost:5000/api/reviews/user/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Sample Test Data

### Valid Review

```json
{
  "itemId": "507f1f77bcf86cd799439011",
  "type": "chef",
  "rating": 5,
  "comment": "Excellent chef! Very professional and the food was absolutely amazing. Highly recommended!"
}
```

### Valid Ratings

```
1 - Poor
2 - Below Average
3 - Average
4 - Good
5 - Excellent
```

### Valid Types

```
maid
chef
tiffin
hostel
flat
```

---

## Notes

1. **Duplicate Prevention**: Users cannot review the same service twice
2. **Public Reviews**: Anyone can view service reviews without authentication
3. **Ownership**: Only review owners can update/delete their reviews
4. **Service Verification**: Service must exist before review can be added
5. **Timestamps**: Automatic createdAt and updatedAt timestamps
6. **Sorting**: Reviews sorted by creation date (newest first)
7. **User Population**: User details (name, city) automatically populated in responses

---

## Implementation Details

### Models Used:

- `Review` - Main review model
- `User` - For user details
- `Maid`, `Chef`, `Tiffin`, `Hostel`, `Flat` - For service verification

### Controllers:

- `addReview` - Creates review with validation and duplicate check
- `getReviews` - Fetches reviews with average rating calculation
- `updateReview` - Updates review with ownership validation
- `deleteReview` - Deletes review with ownership validation
- `getUserReviews` - Fetches user's reviews with security check

### Middleware:

- `authMiddleware` - JWT authentication and user attachment

---

## Frontend Integration Example

```javascript
// Add review
const addReview = async (itemId, type, rating, comment) => {
  const response = await fetch("/api/reviews/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, type, rating, comment }),
  });
  return response.json();
};

// Get service reviews
const getServiceReviews = async (type, id) => {
  const response = await fetch(`/api/reviews/${type}/${id}`);
  return response.json();
};

// Update review
const updateReview = async (reviewId, rating, comment) => {
  const response = await fetch(`/api/reviews/update/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  return response.json();
};
```
