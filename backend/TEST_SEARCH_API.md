# Search API Testing Guide

## Overview

Optimized search API that allows users to search services dynamically using filters with database indexing for performance.

## Base URL

```
http://localhost:5000/api/search
```

## Authentication

No authentication required - public search endpoint

---

## Search Services

**Endpoint:** `GET /api/search`

**Description:** Search services by type with optional location and price filters

**Query Parameters:**

- `type` (required): Service type - "maid", "chef", "tiffin", "hostel", "flat"
- `location` (optional): Location filter (case-insensitive)
- `minPrice` (optional): Minimum price/rent
- `maxPrice` (optional): Maximum price/rent

---

## Usage Examples

### 1. Search All Chefs

```bash
GET /api/search?type=chef
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "Chef Ramesh",
      "phone": "9876543210",
      "location": "Mumbai",
      "cuisine": "indian",
      "price": 15000,
      "experience": 5,
      "availability": "full-time",
      "createdAt": "2026-04-09T10:30:00.000Z",
      "updatedAt": "2026-04-09T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Search Chefs in Mumbai

```bash
GET /api/search?type=chef&location=mumbai
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chef Ramesh",
      "location": "Mumbai",
      "cuisine": "indian",
      "price": 15000,
      "experience": 5
    }
  ]
}
```

---

### 3. Search Chefs with Price Range

```bash
GET /api/search?type=chef&minPrice=10000&maxPrice=20000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chef Ramesh",
      "price": 15000
    }
  ]
}
```

---

### 4. Search Chefs in Mumbai with Price Range

```bash
GET /api/search?type=chef&location=mumbai&minPrice=10000&maxPrice=20000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chef Ramesh",
      "location": "Mumbai",
      "price": 15000
    }
  ]
}
```

---

### 5. Search Hostels

```bash
GET /api/search?type=hostel&location=pune&minPrice=5000&maxPrice=10000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Sunshine Hostel",
      "location": "Pune",
      "rent": 7000,
      "roomsAvailable": 5,
      "gender": "co-ed",
      "foodIncluded": true
    }
  ]
}
```

---

### 6. Search Flats

```bash
GET /api/search?type=flat&location=bangalore&minPrice=15000&maxPrice=30000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Modern Apartment",
      "location": "Bangalore",
      "rent": 25000,
      "bhk": "2BHK",
      "furnished": "fully-furnished",
      "deposit": 50000
    }
  ]
}
```

---

### 7. Search Tiffin Services

```bash
GET /api/search?type=tiffin&location=delhi&maxPrice=3000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Home Tiffin Service",
      "location": "Delhi",
      "foodType": "veg",
      "price": 2500,
      "deliveryAvailable": true,
      "mealType": "both"
    }
  ]
}
```

---

### 8. Search Maids

```bash
GET /api/search?type=maid&location=hyderabad&minPrice=5000&maxPrice=8000
```

**Response:**

```json
{
  "success": true,
  "message": "Search results fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "Lakshmi",
      "location": "Hyderabad",
      "cookingType": "veg",
      "price": 6000,
      "experience": 3,
      "availability": "both"
    }
  ]
}
```

---

## Error Responses

### Missing Type Parameter

```bash
GET /api/search
```

**Response (400):**

```json
{
  "success": false,
  "message": "type parameter is required"
}
```

---

### Invalid Type

```bash
GET /api/search?type=invalid
```

**Response (400):**

```json
{
  "success": false,
  "message": "Invalid type. Must be one of: maid, chef, tiffin, hostel, flat"
}
```

---

### Invalid Price Format

```bash
GET /api/search?type=chef&minPrice=abc
```

**Response (400):**

```json
{
  "success": false,
  "message": "minPrice must be a valid number"
}
```

---

## Performance Optimization

### Database Indexes

All models have optimized indexes for fast queries:

**Maid Model:**

- `location` (index)
- `price` (index)

**Chef Model:**

- `location` (index)
- `price` (index)
- `location + cuisine` (compound index)

**Tiffin Model:**

- `location` (index)
- `price` (index)
- `location + foodType` (compound index)

**Hostel Model:**

- `location` (index)
- `rent` (index)
- `location + gender` (compound index)

**Flat Model:**

- `location` (index)
- `rent` (index)
- `location + bhk` (compound index)

### Query Optimization Features:

1. **Indexed Fields**: All location and price/rent fields are indexed
2. **Lean Queries**: Uses `.lean()` for faster JSON conversion
3. **Efficient Filtering**: Regex for case-insensitive location search
4. **Range Queries**: Optimized $gte and $lte for price ranges
5. **Sorted Results**: Results sorted by creation date (newest first)

---

## Filter Combinations

### All Filters

```bash
GET /api/search?type=chef&location=mumbai&minPrice=10000&maxPrice=20000
```

### Only Location

```bash
GET /api/search?type=chef&location=mumbai
```

### Only Price Range

```bash
GET /api/search?type=chef&minPrice=10000&maxPrice=20000
```

### Only Min Price

```bash
GET /api/search?type=chef&minPrice=10000
```

### Only Max Price

```bash
GET /api/search?type=chef&maxPrice=20000
```

### No Filters (All Results)

```bash
GET /api/search?type=chef
```

---

## Important Notes

### Price Field Mapping:

- **Maid, Chef, Tiffin**: Use `price` field
- **Hostel, Flat**: Use `rent` field
- The API automatically handles this mapping

### Location Search:

- Case-insensitive (Mumbai = mumbai = MUMBAI)
- Partial match supported (Mum matches Mumbai)
- Uses regex for flexible searching

### Results Sorting:

- All results sorted by `createdAt` in descending order
- Newest services appear first

---

## cURL Examples

### Basic Search

```bash
curl -X GET "http://localhost:5000/api/search?type=chef"
```

### Search with Location

```bash
curl -X GET "http://localhost:5000/api/search?type=chef&location=mumbai"
```

### Search with Price Range

```bash
curl -X GET "http://localhost:5000/api/search?type=chef&minPrice=10000&maxPrice=20000"
```

### Complete Search

```bash
curl -X GET "http://localhost:5000/api/search?type=chef&location=mumbai&minPrice=10000&maxPrice=20000"
```

### Search Hostels

```bash
curl -X GET "http://localhost:5000/api/search?type=hostel&location=pune&minPrice=5000&maxPrice=10000"
```

### Search Flats

```bash
curl -X GET "http://localhost:5000/api/search?type=flat&location=bangalore&minPrice=15000&maxPrice=30000"
```

---

## Testing Workflow

### Step 1: Test Basic Search

```bash
GET /api/search?type=chef
```

Expected: All chefs returned

### Step 2: Test Location Filter

```bash
GET /api/search?type=chef&location=mumbai
```

Expected: Only Mumbai chefs returned

### Step 3: Test Price Range

```bash
GET /api/search?type=chef&minPrice=10000&maxPrice=20000
```

Expected: Only chefs with price between 10000-20000

### Step 4: Test Combined Filters

```bash
GET /api/search?type=chef&location=mumbai&minPrice=10000&maxPrice=20000
```

Expected: Mumbai chefs with price 10000-20000

### Step 5: Test Different Types

```bash
GET /api/search?type=hostel&location=pune
GET /api/search?type=flat&location=bangalore
GET /api/search?type=tiffin&location=delhi
GET /api/search?type=maid&location=hyderabad
```

### Step 6: Test Error Cases

```bash
GET /api/search
GET /api/search?type=invalid
GET /api/search?type=chef&minPrice=abc
```

---

## Common Error Codes

- **200**: Success
- **400**: Bad request (missing/invalid parameters)
- **500**: Internal server error

---

## Performance Tips

1. **Use Specific Filters**: More filters = faster queries
2. **Location Index**: Location searches are optimized with indexes
3. **Price Range**: Price range queries use indexed fields
4. **Lean Queries**: Results are returned as plain JavaScript objects for speed
5. **Compound Indexes**: Some models have compound indexes for common filter combinations

---

## Implementation Details

### Controller Logic:

1. Validate `type` parameter
2. Select correct model based on type
3. Determine price field (price vs rent)
4. Build query filters dynamically
5. Execute optimized database query
6. Return sorted results

### Models Used:

- `Maid` - For maid services
- `Chef` - For chef services
- `Tiffin` - For tiffin services
- `Hostel` - For hostel listings
- `Flat` - For flat rentals

### No Authentication:

- Public search endpoint
- No JWT token required
- Anyone can search services

---

## Quick Reference

| Service Type | Price Field | Example Location  |
| ------------ | ----------- | ----------------- |
| maid         | price       | Mumbai, Delhi     |
| chef         | price       | Mumbai, Pune      |
| tiffin       | price       | Delhi, Bangalore  |
| hostel       | rent        | Pune, Hyderabad   |
| flat         | rent        | Bangalore, Mumbai |

---

## Sample URLs

```
# All chefs
http://localhost:5000/api/search?type=chef

# Mumbai chefs
http://localhost:5000/api/search?type=chef&location=mumbai

# Affordable chefs
http://localhost:5000/api/search?type=chef&maxPrice=15000

# Premium chefs in Mumbai
http://localhost:5000/api/search?type=chef&location=mumbai&minPrice=20000

# Budget hostels in Pune
http://localhost:5000/api/search?type=hostel&location=pune&maxPrice=8000

# 2BHK flats in Bangalore
http://localhost:5000/api/search?type=flat&location=bangalore&minPrice=15000&maxPrice=30000
```
