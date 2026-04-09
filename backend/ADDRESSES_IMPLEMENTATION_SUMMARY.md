# Address Management System Implementation Summary

## What Was Implemented

### 1. User Model Extension

**File:** `backend/src/models/User.js`

Added `addresses` array field to User schema:

```javascript
addresses: [
  {
    label: String, // "home", "work", "other"
    addressLine: String, // Full address (10-200 chars)
    city: String, // City name
    state: String, // State name
    pincode: String, // 6-digit pincode
    isDefault: Boolean, // Default address flag
    addedAt: Date, // Timestamp
  },
];
```

**Validation:**

- Label: Must be "home", "work", or "other"
- Address Line: 10-200 characters
- Pincode: Exactly 6 digits
- All text fields automatically trimmed

### 2. Address Controller

**File:** `backend/src/controllers/address.controller.js`

Implemented 5 controller functions:

- `getUserAddresses` - Get all addresses with count
- `addAddress` - Add address with validation and auto-default
- `updateAddress` - Update address with ownership validation
- `deleteAddress` - Delete address with default handling
- `setDefaultAddress` - Set default with automatic reset

### 3. Address Routes

**File:** `backend/src/routes/address.routes.js`

Created 5 API endpoints:

- `GET /api/addresses/:userId` (auth required)
- `POST /api/addresses/add` (auth required)
- `PUT /api/addresses/update/:id` (auth required)
- `DELETE /api/addresses/delete/:id` (auth required)
- `PUT /api/addresses/default/:id` (auth required)

### 4. Route Registration

**File:** `backend/index.js`

Registered address routes under `/api/addresses` prefix

---

## API Endpoints

| Method | Endpoint                     | Auth | Description         |
| ------ | ---------------------------- | ---- | ------------------- |
| GET    | `/api/addresses/:userId`     | ✓    | Get user addresses  |
| POST   | `/api/addresses/add`         | ✓    | Add new address     |
| PUT    | `/api/addresses/update/:id`  | ✓    | Update address      |
| DELETE | `/api/addresses/delete/:id`  | ✓    | Delete address      |
| PUT    | `/api/addresses/default/:id` | ✓    | Set default address |

---

## Key Features

✓ **Multiple Addresses**: Users can add multiple addresses
✓ **Default Address**: One address marked as default
✓ **Auto-Default**: First address automatically set as default
✓ **Label System**: Addresses labeled as home, work, or other
✓ **Validation**: Complete validation for all fields
✓ **Ownership Security**: Users can only manage their own addresses
✓ **Default Handling**: Smart handling when default address is deleted
✓ **Update Flexibility**: Update any field independently
✓ **Count Tracking**: Returns total address count

---

## Default Address Logic

### Adding First Address

```javascript
// First address is automatically set as default
isDefault: addresses.length === 0;
```

### Setting New Default

```javascript
// All addresses set to non-default
addresses.forEach((addr) => (addr.isDefault = false));
// Selected address set as default
selectedAddress.isDefault = true;
```

### Deleting Default Address

```javascript
// If deleted address was default and others exist
if (wasDefault && addresses.length > 0) {
  addresses[0].isDefault = true; // First remaining becomes default
}
```

---

## Validation Rules

| Field       | Rule                       | Example                   |
| ----------- | -------------------------- | ------------------------- |
| label       | Must be: home, work, other | "home"                    |
| addressLine | 10-200 characters          | "123 Main Street, Apt 4B" |
| city        | Required, trimmed          | "Mumbai"                  |
| state       | Required, trimmed          | "Maharashtra"             |
| pincode     | Exactly 6 digits           | "400001"                  |

---

## Security Features

1. **Authentication**: All endpoints require JWT token
2. **Ownership Validation**: Users can only access their own addresses
3. **Input Validation**: All fields validated before saving
4. **Automatic Trimming**: Whitespace removed from text fields
5. **Case Normalization**: Labels converted to lowercase

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

## Usage Examples

### Add Address

```javascript
POST /api/addresses/add
{
  "label": "home",
  "addressLine": "123 Main Street, Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

### Get Addresses

```javascript
GET /api/addresses/:userId
// Returns all addresses with count and default flag
```

### Update Address

```javascript
PUT /api/addresses/update/:id
{
  "city": "Pune",
  "pincode": "411001"
}
```

### Set Default

```javascript
PUT /api/addresses/default/:id
// Sets selected address as default, others become non-default
```

### Delete Address

```javascript
DELETE /api/addresses/delete/:id
// Deletes address, handles default reassignment
```

---

## Testing

See `TEST_ADDRESSES_API.md` for:

- Complete API documentation
- Request/response examples
- cURL commands
- Validation rules
- Testing workflow
- Error responses
- Frontend integration examples

---

## Data Storage

Addresses are stored as an array within the User document:

- No separate collection needed
- Efficient queries (single document read)
- Atomic updates
- Embedded document benefits

---

## Frontend Integration

```javascript
// Fetch addresses
const addresses = await fetch(`/api/addresses/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// Add address
await fetch("/api/addresses/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(addressData),
});

// Set default
await fetch(`/api/addresses/default/${addressId}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## Common Use Cases

1. **Checkout Flow**: Select delivery address from saved addresses
2. **Profile Management**: Manage saved addresses
3. **Service Booking**: Choose service location from addresses
4. **Default Selection**: Quick checkout with default address
5. **Multiple Locations**: Save home, work, and other addresses

---

## Error Handling

All endpoints include comprehensive error handling:

- Missing fields validation
- Invalid format validation
- Ownership verification
- Resource existence checks
- Graceful error messages

---

## Performance Considerations

1. **Embedded Documents**: Fast reads (single query)
2. **Array Operations**: Efficient with MongoDB array methods
3. **Validation**: Server-side validation prevents bad data
4. **Indexes**: User document already indexed
5. **Atomic Updates**: Safe concurrent operations

---

## Next Steps

1. ✓ Start server
2. ✓ Test all endpoints
3. → Integrate with frontend
4. → Add address selection in booking flow
5. → Add address selection in checkout
6. → Optional enhancements:
   - Add address validation service (Google Maps API)
   - Add coordinates (latitude/longitude)
   - Add address type icons
   - Add address nickname field
   - Add delivery instructions field

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── User.js                  # Extended with addresses
│   ├── controllers/
│   │   └── address.controller.js    # Address controllers
│   └── routes/
│       └── address.routes.js        # Address routes
└── index.js                         # Updated with address routes
```

---

## Quick Commands

```bash
# Get addresses
curl -X GET http://localhost:5000/api/addresses/USER_ID \
  -H "Authorization: Bearer TOKEN"

# Add address
curl -X POST http://localhost:5000/api/addresses/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"label":"home","addressLine":"123 Main St","city":"Mumbai","state":"Maharashtra","pincode":"400001"}'

# Update address
curl -X PUT http://localhost:5000/api/addresses/update/ADDRESS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"city":"Pune"}'

# Set default
curl -X PUT http://localhost:5000/api/addresses/default/ADDRESS_ID \
  -H "Authorization: Bearer TOKEN"

# Delete address
curl -X DELETE http://localhost:5000/api/addresses/delete/ADDRESS_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Notes

- Addresses stored in User model (no separate collection)
- First address automatically set as default
- Only one address can be default at a time
- Deleting default address auto-assigns new default
- All text fields automatically trimmed
- Labels converted to lowercase
- Complete validation on all operations
- Users can only manage their own addresses
