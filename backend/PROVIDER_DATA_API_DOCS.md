# Provider Data API Documentation

## Overview

The Provider Data API allows authenticated users to fetch all their provider services (Maid, Chef, Tiffin, Hostel, Flat) in a single API call. This is perfect for building provider dashboards.

---

## 📡 API Endpoint

### Get Provider Data

**Endpoint:** `GET /api/users/provider-data/:userId`

**Description:** Fetch all provider services created by a specific user

**Authentication:** Required (JWT token)

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId of the user

**Headers:**

```http
Authorization: Bearer <token>
```

**Security:**

- Users can only fetch their own provider data
- Attempting to fetch another user's data returns 403 Forbidden

---

## 📊 Response Format

### Success Response (200):

```json
{
  "success": true,
  "message": "Provider data fetched successfully",
  "data": {
    "maids": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Maid Service",
        "location": "Mumbai",
        "price": 5000,
        "availability": "both",
        "experience": 3,
        "phone": "9876543210",
        "cookingType": "veg",
        "createdAt": "2026-04-09T10:00:00.000Z",
        "updatedAt": "2026-04-09T10:00:00.000Z"
      }
    ],
    "chefs": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439020",
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
    ],
    "tiffins": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "userId": "507f1f77bcf86cd799439020",
        "name": "Home Tiffin Service",
        "phone": "9876543210",
        "location": "Mumbai",
        "foodType": "veg",
        "price": 3000,
        "deliveryAvailable": true,
        "mealType": "both",
        "createdAt": "2026-04-09T10:00:00.000Z",
        "updatedAt": "2026-04-09T10:00:00.000Z"
      }
    ],
    "hostels": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": "507f1f77bcf86cd799439020",
        "name": "Student Hostel",
        "phone": "9876543210",
        "location": "Mumbai",
        "rent": 8000,
        "roomsAvailable": 5,
        "amenities": ["WiFi", "AC", "Laundry"],
        "gender": "co-ed",
        "foodIncluded": true,
        "createdAt": "2026-04-09T10:00:00.000Z",
        "updatedAt": "2026-04-09T10:00:00.000Z"
      }
    ],
    "flats": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "userId": "507f1f77bcf86cd799439020",
        "name": "Spacious 2BHK",
        "phone": "9876543210",
        "location": "Mumbai",
        "rent": 25000,
        "bhk": "2BHK",
        "furnished": "fully-furnished",
        "deposit": 50000,
        "availableFrom": "2026-05-01T00:00:00.000Z",
        "createdAt": "2026-04-09T10:00:00.000Z",
        "updatedAt": "2026-04-09T10:00:00.000Z"
      }
    ],
    "summary": {
      "totalServices": 5,
      "maidsCount": 1,
      "chefsCount": 1,
      "tiffinsCount": 1,
      "hostelsCount": 1,
      "flatsCount": 1
    }
  }
}
```

### Empty Response (No Services):

```json
{
  "success": true,
  "message": "Provider data fetched successfully",
  "data": {
    "maids": [],
    "chefs": [],
    "tiffins": [],
    "hostels": [],
    "flats": [],
    "summary": {
      "totalServices": 0,
      "maidsCount": 0,
      "chefsCount": 0,
      "tiffinsCount": 0,
      "hostelsCount": 0,
      "flatsCount": 0
    }
  }
}
```

---

## ❌ Error Responses

### 401 - Unauthorized (No Token):

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 403 - Forbidden (Accessing Another User's Data):

```json
{
  "success": false,
  "message": "Unauthorized. You can only view your own provider data"
}
```

### 500 - Server Error:

```json
{
  "success": false,
  "message": "Error fetching provider data",
  "error": "Detailed error message"
}
```

---

## 🧪 Testing

### Example Request:

```bash
# Get your provider data
curl http://localhost:5000/api/users/provider-data/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### PowerShell:

```powershell
$token = "your-jwt-token"
$userId = "507f1f77bcf86cd799439020"

Invoke-RestMethod -Uri "http://localhost:5000/api/users/provider-data/$userId" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}
```

### JavaScript/Frontend:

```javascript
const token = localStorage.getItem("authToken");
const userId = JSON.parse(localStorage.getItem("user")).id;

const response = await fetch(`/api/users/provider-data/${userId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const data = await response.json();

if (data.success) {
  console.log("Total Services:", data.data.summary.totalServices);
  console.log("Chefs:", data.data.chefs);
  console.log("Tiffins:", data.data.tiffins);
  console.log("Hostels:", data.data.hostels);
  console.log("Flats:", data.data.flats);
  console.log("Maids:", data.data.maids);
}
```

---

## 🎨 Frontend Integration

### Provider Dashboard Example:

```javascript
import { useState, useEffect } from "react";

function ProviderDashboard() {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch(`/api/users/provider-data/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setProviderData(data.data);
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="provider-dashboard">
      <h1>My Services</h1>

      <div className="summary">
        <h2>Total Services: {providerData.summary.totalServices}</h2>
      </div>

      {providerData.chefs.length > 0 && (
        <section>
          <h3>Chef Services ({providerData.summary.chefsCount})</h3>
          {providerData.chefs.map((chef) => (
            <div key={chef._id}>
              <h4>{chef.name}</h4>
              <p>Cuisine: {chef.cuisine}</p>
              <p>Price: ₹{chef.price}/month</p>
            </div>
          ))}
        </section>
      )}

      {providerData.tiffins.length > 0 && (
        <section>
          <h3>Tiffin Services ({providerData.summary.tiffinsCount})</h3>
          {providerData.tiffins.map((tiffin) => (
            <div key={tiffin._id}>
              <h4>{tiffin.name}</h4>
              <p>Food Type: {tiffin.foodType}</p>
              <p>Price: ₹{tiffin.price}/month</p>
            </div>
          ))}
        </section>
      )}

      {providerData.hostels.length > 0 && (
        <section>
          <h3>Hostel Listings ({providerData.summary.hostelsCount})</h3>
          {providerData.hostels.map((hostel) => (
            <div key={hostel._id}>
              <h4>{hostel.name}</h4>
              <p>Rent: ₹{hostel.rent}/month</p>
              <p>Rooms Available: {hostel.roomsAvailable}</p>
            </div>
          ))}
        </section>
      )}

      {providerData.flats.length > 0 && (
        <section>
          <h3>Flat Listings ({providerData.summary.flatsCount})</h3>
          {providerData.flats.map((flat) => (
            <div key={flat._id}>
              <h4>{flat.name}</h4>
              <p>Type: {flat.bhk}</p>
              <p>Rent: ₹{flat.rent}/month</p>
            </div>
          ))}
        </section>
      )}

      {providerData.maids.length > 0 && (
        <section>
          <h3>Maid Services ({providerData.summary.maidsCount})</h3>
          {providerData.maids.map((maid) => (
            <div key={maid._id}>
              <h4>{maid.name}</h4>
              <p>Location: {maid.location}</p>
              <p>Price: ₹{maid.price}/month</p>
            </div>
          ))}
        </section>
      )}

      {providerData.summary.totalServices === 0 && (
        <div className="empty-state">
          <p>You haven't created any services yet.</p>
          <button onClick={() => navigate("/create-service")}>
            Create Your First Service
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Performance Features

### Efficient Queries:

- Uses `Promise.all()` to fetch all data in parallel
- Reduces total query time significantly
- Uses `.lean()` for faster queries (returns plain JavaScript objects)

### Single API Call:

- Frontend makes only 1 request instead of 5
- Reduces network overhead
- Better user experience (faster loading)

### Summary Statistics:

- Provides count of each service type
- Total services count
- Useful for dashboard metrics

---

## 🔒 Security Features

### Authorization:

- Requires valid JWT token
- Users can only access their own data
- Prevents unauthorized data access

### Validation:

- Validates userId format
- Checks user authentication
- Proper error messages

---

## 💡 Use Cases

### 1. Provider Dashboard:

Display all services created by the provider in one view

### 2. Service Management:

Show list of services with edit/delete options

### 3. Analytics:

Display statistics about provider's services

### 4. Quick Overview:

Show summary of all active listings

### 5. Service Status:

Check which services are active/inactive

---

## 📊 Response Data Structure

### Data Object Contains:

- `maids` - Array of maid services
- `chefs` - Array of chef profiles
- `tiffins` - Array of tiffin services
- `hostels` - Array of hostel listings
- `flats` - Array of flat listings
- `summary` - Statistics object with counts

### Summary Object Contains:

- `totalServices` - Total count of all services
- `maidsCount` - Number of maid services
- `chefsCount` - Number of chef profiles
- `tiffinsCount` - Number of tiffin services
- `hostelsCount` - Number of hostel listings
- `flatsCount` - Number of flat listings

---

## 🎯 Summary

The Provider Data API:

✅ Fetches all provider services in one call
✅ Efficient parallel queries
✅ Secure (users can only access their own data)
✅ Includes summary statistics
✅ Perfect for provider dashboards
✅ Consistent response format
✅ Comprehensive error handling
✅ Production-ready

This endpoint is ideal for building provider dashboards and management interfaces!
