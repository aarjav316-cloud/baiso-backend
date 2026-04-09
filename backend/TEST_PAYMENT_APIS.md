# Payment Methods API Testing Guide

## Overview

Simple payment methods management system where users can add/remove cards and UPI IDs for future transactions.

## Base URL

```
http://localhost:5000/api/payment
```

## Authentication

All endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Get Payment Methods

**Endpoint:** `GET /api/payment/methods/:userId`

**Description:** Get all payment methods (cards and UPI) for a user

**URL Parameters:**

- `userId`: User ID (must match authenticated user)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment methods fetched successfully",
  "data": {
    "cards": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "cardNumber": "****1234",
        "expiry": "12/25",
        "name": "John Doe",
        "addedAt": "2026-04-09T10:30:00.000Z"
      }
    ],
    "upi": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "upiId": "john@paytm",
        "addedAt": "2026-04-09T10:35:00.000Z"
      }
    ]
  }
}
```

**Security Features:**

- Card numbers are masked (only last 4 digits shown)
- User can only access their own payment methods

**Error Responses:**

- 403: Unauthorized (accessing another user's data)
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/payment/methods/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 2. Add Card

**Endpoint:** `POST /api/payment/card/add`

**Description:** Add a new card to user's payment methods

**Request Body:**

```json
{
  "cardNumber": "1234567890123456",
  "expiry": "12/25",
  "name": "John Doe"
}
```

**Fields:**

- `cardNumber` (required): 16-digit card number
- `expiry` (required): Expiry date in MM/YY format
- `name` (required): Cardholder name

**Validation Rules:**

- Card number must be exactly 16 digits
- Expiry must be in MM/YY format (e.g., 01/25, 12/26)
- Duplicate cards are prevented

**Success Response (201):**

```json
{
  "success": true,
  "message": "Card added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "cardNumber": "****3456",
    "expiry": "12/25",
    "name": "John Doe",
    "addedAt": "2026-04-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing required fields
- 400: Invalid card number format (must be 16 digits)
- 400: Invalid expiry format (must be MM/YY)
- 400: Card already exists
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/payment/card/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cardNumber": "1234567890123456",
    "expiry": "12/25",
    "name": "John Doe"
  }'
```

---

## 3. Remove Card

**Endpoint:** `POST /api/payment/card/remove`

**Description:** Remove a card from user's payment methods

**Request Body:**

```json
{
  "cardId": "507f1f77bcf86cd799439011"
}
```

**Fields:**

- `cardId` (required): MongoDB ObjectId of the card to remove

**Success Response (200):**

```json
{
  "success": true,
  "message": "Card removed successfully",
  "data": {
    "remainingCards": 2
  }
}
```

**Error Responses:**

- 400: Missing cardId
- 404: Card not found
- 404: No cards found
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/payment/card/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cardId": "507f1f77bcf86cd799439011"
  }'
```

---

## 4. Add UPI

**Endpoint:** `POST /api/payment/upi/add`

**Description:** Add a new UPI ID to user's payment methods

**Request Body:**

```json
{
  "upiId": "john@paytm"
}
```

**Fields:**

- `upiId` (required): Valid UPI ID (format: username@provider)

**Validation Rules:**

- UPI ID must match format: username@provider
- Examples: john@paytm, user123@phonepe, name@gpay
- Duplicate UPI IDs are prevented

**Success Response (201):**

```json
{
  "success": true,
  "message": "UPI added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "upiId": "john@paytm",
    "addedAt": "2026-04-09T10:35:00.000Z"
  }
}
```

**Error Responses:**

- 400: Missing upiId
- 400: Invalid UPI ID format
- 400: UPI ID already exists
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/payment/upi/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "upiId": "john@paytm"
  }'
```

---

## 5. Remove UPI

**Endpoint:** `POST /api/payment/upi/remove`

**Description:** Remove a UPI ID from user's payment methods

**Request Body:**

```json
{
  "upiId": "john@paytm"
}
```

**Fields:**

- `upiId` (required): UPI ID to remove (can be the actual UPI ID or MongoDB ObjectId)

**Success Response (200):**

```json
{
  "success": true,
  "message": "UPI removed successfully",
  "data": {
    "remainingUPIs": 1
  }
}
```

**Error Responses:**

- 400: Missing upiId
- 404: UPI ID not found
- 404: No UPI IDs found
- 404: User not found
- 401: Unauthorized (no token)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/payment/upi/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "upiId": "john@paytm"
  }'
```

---

## Data Structure

### User Model Extension

```javascript
paymentMethods: {
  cards: [
    {
      cardNumber: String,      // 16 digits
      expiry: String,          // MM/YY format
      name: String,            // Cardholder name
      addedAt: Date
    }
  ],
  upi: [
    {
      upiId: String,           // username@provider
      addedAt: Date
    }
  ]
}
```

---

## Validation Rules

### Card Number

- Must be exactly 16 digits
- Only numeric characters allowed
- Example: `1234567890123456`

### Card Expiry

- Format: MM/YY
- Month: 01-12
- Year: 2 digits
- Examples: `01/25`, `12/26`, `06/30`

### UPI ID

- Format: username@provider
- Must contain @ symbol
- Alphanumeric, dots, hyphens allowed
- Examples: `john@paytm`, `user.name@phonepe`, `test-123@gpay`

---

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Ownership Validation**: Users can only manage their own payment methods
3. **Card Masking**: Card numbers are masked in responses (only last 4 digits shown)
4. **Duplicate Prevention**: System prevents adding duplicate cards or UPI IDs
5. **No Real Payment Processing**: This is a storage system only, no actual payment gateway integration

---

## Testing Workflow

### Step 1: Get Current Payment Methods

```bash
GET /api/payment/methods/<user_id>
```

### Step 2: Add a Card

```bash
POST /api/payment/card/add
{
  "cardNumber": "1234567890123456",
  "expiry": "12/25",
  "name": "John Doe"
}
```

### Step 3: Add UPI ID

```bash
POST /api/payment/upi/add
{
  "upiId": "john@paytm"
}
```

### Step 4: Verify Payment Methods

```bash
GET /api/payment/methods/<user_id>
```

### Step 5: Remove Card (Optional)

```bash
POST /api/payment/card/remove
{
  "cardId": "<card_id>"
}
```

### Step 6: Remove UPI (Optional)

```bash
POST /api/payment/upi/remove
{
  "upiId": "john@paytm"
}
```

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

### Valid Card Numbers (for testing)

```
1234567890123456
4111111111111111
5500000000000004
```

### Valid Expiry Dates

```
01/25
12/26
06/30
```

### Valid UPI IDs

```
john@paytm
user123@phonepe
test.user@gpay
name-123@upi
```

---

## Quick Test Commands

Replace `YOUR_JWT_TOKEN` and IDs with actual values:

```bash
# Get payment methods
curl -X GET http://localhost:5000/api/payment/methods/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Add card
curl -X POST http://localhost:5000/api/payment/card/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"cardNumber":"1234567890123456","expiry":"12/25","name":"John Doe"}'

# Remove card
curl -X POST http://localhost:5000/api/payment/card/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"cardId":"CARD_ID"}'

# Add UPI
curl -X POST http://localhost:5000/api/payment/upi/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"upiId":"john@paytm"}'

# Remove UPI
curl -X POST http://localhost:5000/api/payment/upi/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"upiId":"john@paytm"}'
```

---

## Notes

1. **No Real Payment Gateway**: This system only stores payment method details, it doesn't process actual payments
2. **Card Security**: Full card numbers are stored but masked in API responses
3. **Duplicate Prevention**: System checks for duplicate cards (by card number) and UPI IDs
4. **Flexible Removal**: UPI can be removed by either the UPI ID string or MongoDB ObjectId
5. **Auto-initialization**: Payment methods object is automatically created if it doesn't exist
6. **Timestamps**: All payment methods include `addedAt` timestamp

---

## Implementation Details

### Models:

- Extended `User` model with `paymentMethods` field

### Controllers:

- `getPaymentMethods`: Fetches and masks card data
- `addCard`: Validates and adds card with duplicate check
- `removeCard`: Removes card by ID
- `addUPI`: Validates and adds UPI with duplicate check
- `removeUPI`: Removes UPI by ID or UPI string

### Middleware:

- `authMiddleware`: JWT authentication and user attachment

### Routes:

- All routes under `/api/payment` prefix
- All routes require authentication
