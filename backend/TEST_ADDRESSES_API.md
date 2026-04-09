# Address Management API Testing Guide

## Overview

Complete address management system where users can manage multiple addresses with one default address.

## Base URL

```
http://localhost:5000/api/addresses
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get User Addresses

**Endpoint:** `GET /api/addresses/:userId`

**Authentication:** Required

**Description:** Get all addresses for a user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Addresses fetched successfully",
  "data": {
    "addresses": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "label": "home",
        "addressLine": "123 Main Street, Apartment 4B",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "isDefault": true,
        "addedAt": "2026-04-09T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "label": "work",
        "addressLine": "456 Business Park, Tower A, Floor 5",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400051",
        "isDefault": false,
        "addedAt": "2026-04-08T10:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Error Responses:**

- 403: Unauthorized (accessing another user's addresses)
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/addresses/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 2. Add Address

**Endpoint:** `POST /api/addresses/add`

**Authentication:** Required

**Description:** Add a new address

**Request Body:**

```json
{
  "label": "home",
  "addressLine": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Fields:**

- `label` (required): Address label - "home", "work", or "other"
- `addressLine` (required): Full address (10-200 characters)
- `city` (required): City name
- `state` (required): State name
- `pincode` (required): 6-digit pincode

**Success Response (201):**

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "label": "home",
    "addressLine": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "isDefault": true,
    "addedAt": "2026-04-09T10:30:00.000Z"
  }
}
```

**Notes:**

- First address is automatically set as default
- Address line must be 10-200 characters
- Pincode must be exactly 6 digits

**Error Responses:**

- 400: Missing required fields
- 400: Invalid label (must be home, work, or other)
- 400: Invalid pincode (must be 6 digits)
- 400: Address too short (min 10 chars) or too long (max 200 chars)
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/addresses/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "label": "home",
    "addressLine": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'
```

---

## 3. Update Address

**Endpoint:** `PUT /api/addresses/update/:id`

**Authentication:** Required

**Description:** Update an existing address

**URL Parameters:**

- `id`: Address ID

**Request Body:**

```json
{
  "label": "work",
  "addressLine": "456 Business Park, Tower A, Floor 5",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400051"
}
```

**Fields (all optional, provide at least one):**

- `label`: Address label - "home", "work", or "other"
- `addressLine`: Full address (10-200 characters)
- `city`: City name
- `state`: State name
- `pincode`: 6-digit pincode

**Success Response (200):**

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "label": "work",
    "addressLine": "456 Business Park, Tower A, Floor 5",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400051",
    "isDefault": true,
    "addedAt": "2026-04-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- 400: No fields provided to update
- 400: Invalid label
- 400: Invalid pincode
- 400: Address too short or too long
- 404: Address not found
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/addresses/update/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "label": "work",
    "city": "Pune"
  }'
```

---

## 4. Delete Address

**Endpoint:** `DELETE /api/addresses/delete/:id`

**Authentication:** Required

**Description:** Delete an address

**URL Parameters:**

- `id`: Address ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": {
    "deletedAddressId": "507f1f77bcf86cd799439011",
    "remainingAddresses": 1
  }
}
```

**Notes:**

- If deleted address was default and other addresses exist, the first remaining address becomes default
- If it's the last address, no default is set

**Error Responses:**

- 404: Address not found
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X DELETE http://localhost:5000/api/addresses/delete/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Set Default Address

**Endpoint:** `PUT /api/addresses/default/:id`

**Authentication:** Required

**Description:** Set an address as default

**URL Parameters:**

- `id`: Address ID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Default address updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "label": "work",
    "addressLine": "456 Business Park, Tower A, Floor 5",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400051",
    "isDefault": true,
    "addedAt": "2026-04-08T10:30:00.000Z"
  }
}
```

**Notes:**

- All other addresses are automatically set to `isDefault: false`
- Only one address can be default at a time

**Error Responses:**

- 404: Address not found
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X PUT http://localhost:5000/api/addresses/default/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Address Model Structure

```javascript
{
  label: String,              // "home", "work", "other"
  addressLine: String,        // Full address (10-200 chars)
  city: String,               // City name
  state: String,              // State name
  pincode: String,            // 6-digit pincode
  isDefault: Boolean,         // Default address flag
  addedAt: Date              // Timestamp
}
```

---

## Validation Rules

### Label

- Required for add address
- Must be one of: "home", "work", "other"
- Case-insensitive (converted to lowercase)

### Address Line

- Required for add address
- Minimum length: 10 characters
- Maximum length: 200 characters
- Automatically trimmed

### City

- Required for add address
- Automatically trimmed

### State

- Required for add address
- Automatically trimmed

### Pincode

- Required for add address
- Must be exactly 6 digits
- Format: `^\d{6}$`
- Examples: `400001`, `110001`, `560001`

### Default Address

- First address is automatically set as default
- Only one address can be default at a time
- When default address is deleted, first remaining address becomes default

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Ownership Validation**: Users can only access/modify their own addresses
3. **Input Validation**: All fields validated before saving
4. **Automatic Trimming**: Whitespace automatically removed from text fields

---

## Testing Workflow

### Step 1: Add First Address

```bash
POST /api/addresses/add
{
  "label": "home",
  "addressLine": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

Result: Address added and set as default

### Step 2: Add Second Address

```bash
POST /api/addresses/add
{
  "label": "work",
  "addressLine": "456 Business Park, Tower A",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400051"
}
```

Result: Address added, first address remains default

### Step 3: Get All Addresses

```bash
GET /api/addresses/<user_id>
```

Result: Returns both addresses with default flag

### Step 4: Set Work as Default

```bash
PUT /api/addresses/default/<work_address_id>
```

Result: Work address becomes default, home becomes non-default

### Step 5: Update Address

```bash
PUT /api/addresses/update/<address_id>
{
  "city": "Pune"
}
```

Result: Address city updated

### Step 6: Delete Address

```bash
DELETE /api/addresses/delete/<address_id>
```

Result: Address deleted, if it was default, other address becomes default

---

## Common Error Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (accessing another user's data)
- **404**: Resource not found
- **500**: Internal server error

---

## Sample Test Data

### Valid Addresses

```json
{
  "label": "home",
  "addressLine": "123 Main Street, Apartment 4B, Near City Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

```json
{
  "label": "work",
  "addressLine": "456 Business Park, Tower A, Floor 5, Sector 21",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

```json
{
  "label": "other",
  "addressLine": "789 Lake View Apartments, Building C, Flat 302",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001"
}
```

### Valid Labels

```
home
work
other
```

### Valid Pincodes

```
400001 (Mumbai)
110001 (Delhi)
560001 (Bangalore)
411001 (Pune)
600001 (Chennai)
```

---

## Quick Test Commands

Replace `YOUR_JWT_TOKEN` and IDs with actual values:

```bash
# Get addresses
curl -X GET http://localhost:5000/api/addresses/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add address
curl -X POST http://localhost:5000/api/addresses/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"label":"home","addressLine":"123 Main St","city":"Mumbai","state":"Maharashtra","pincode":"400001"}'

# Update address
curl -X PUT http://localhost:5000/api/addresses/update/ADDRESS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"city":"Pune"}'

# Delete address
curl -X DELETE http://localhost:5000/api/addresses/delete/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Set default
curl -X PUT http://localhost:5000/api/addresses/default/ADDRESS_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Integration Example

```javascript
// Fetch addresses
const fetchAddresses = async (userId, token) => {
  const response = await fetch(`/api/addresses/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Add address
const addAddress = async (addressData, token) => {
  const response = await fetch("/api/addresses/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
  return response.json();
};

// Update address
const updateAddress = async (addressId, updates, token) => {
  const response = await fetch(`/api/addresses/update/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  return response.json();
};

// Delete address
const deleteAddress = async (addressId, token) => {
  const response = await fetch(`/api/addresses/delete/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

// Set default address
const setDefaultAddress = async (addressId, token) => {
  const response = await fetch(`/api/addresses/default/${addressId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

---

## Notes

1. **First Address**: Automatically set as default
2. **Default Management**: Only one address can be default at a time
3. **Delete Default**: If default address is deleted, first remaining address becomes default
4. **Ownership**: Users can only manage their own addresses
5. **Validation**: All fields validated before saving
6. **Trimming**: Text fields automatically trimmed
7. **Case Handling**: Labels converted to lowercase

---

## Implementation Details

### Models Used:

- Extended `User` model with `addresses` array field

### Controllers:

- `getUserAddresses` - Fetches all addresses with count
- `addAddress` - Adds address with validation and auto-default
- `updateAddress` - Updates address with ownership check
- `deleteAddress` - Deletes address with default handling
- `setDefaultAddress` - Sets default with automatic reset of others

### Middleware:

- `authMiddleware` - JWT authentication and user attachment

### Routes:

- All routes under `/api/addresses` prefix
- All routes require authentication
