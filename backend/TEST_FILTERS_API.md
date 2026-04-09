# Filters API Testing Guide

## Overview

Dynamic filters API that provides available filter options based on actual data in the database for each service type.

## Base URL

```
http://localhost:5000/api/filters
```

## Authentication

No authentication required - public endpoint

---

## Get Filters by Type

**Endpoint:** `GET /api/filters/:type`

**Description:** Get dynamic filter options for a specific service type

**URL Parameters:**

- `type` (required): Service type - "maid", "chef", "tiffin", "hostel", "flat"

---

## Usage Examples

### 1. Get Maid Filters

**Request:**

```bash
GET /api/filters/maid
```

**Response (200):**

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      "locations": ["Bangalore", "Delhi", "Hyderabad", "Mumbai", "Pune"],
      "priceRange": {
        "min": 5000,
        "max": 10000
      },
      "availability": ["both", "evening", "morning"],
      "cookingType": ["non-veg", "veg"]
    }
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/filters/maid
```

---

### 2. Get Chef Filters

**Request:**

```bash
GET /api/filters/chef
```

**Response (200):**

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      "locations": ["Bangalore", "Delhi", "Mumbai", "Pune"],
      "priceRange": {
        "min": 10000,
        "max": 25000
      },
      "cuisine": [
        "chinese",
        "continental",
        "indian",
        "italian",
        "multi-cuisine"
      ],
      "availability": ["both", "evening", "full-time", "morning"]
    }
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/filters/chef
```

---

### 3. Get Tiffin Filters

**Request:**

```bash
GET /api/filters/tiffin
```

**Response (200):**

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      "locations": ["Bangalore", "Delhi", "Mumbai", "Pune"],
      "priceRange": {
        "min": 2000,
        "max": 5000
      },
      "foodType": ["both", "non-veg", "veg"],
      "mealType": ["both", "dinner", "lunch"],
      "deliveryAvailable": [true, false]
    }
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/filters/tiffin
```

---

### 4. Get Hostel Filters

**Request:**

```bash
GET /api/filters/hostel
```

**Response (200):**

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      "locations": ["Bangalore", "Delhi", "Mumbai", "Pune"],
      "rentRange": {
        "min": 5000,
        "max": 15000
      },
      "gender": ["co-ed", "female", "male"],
      "amenities": ["AC", "Gym", "Laundry", "Parking", "WiFi"],
      "foodIncluded": [true, false]
    }
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/filters/hostel
```

---

### 5. Get Flat Filters

**Request:**

```bash
GET /api/filters/flat
```

**Response (200):**

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      "locations": ["Bangalore", "Delhi", "Mumbai", "Pune"],
      "rentRange": {
        "min": 15000,
        "max": 50000
      },
      "bhk": ["1BHK", "1RK", "2BHK", "3BHK", "4BHK"],
      "furnished": ["fully-furnished", "semi-furnished", "unfurnished"]
    }
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:5000/api/filters/flat
```

---

## Error Responses

### Invalid Type

**Request:**

```bash
GET /api/filters/invalid
```

**Response (400):**

```json
{
  "success": false,
  "message": "Invalid type. Must be one of: maid, chef, tiffin, hostel, flat"
}
```

---

## Filter Data Structure

### Maid Filters

```javascript
{
  locations: string[],           // Distinct locations
  priceRange: {
    min: number,                 // Minimum price
    max: number                  // Maximum price
  },
  availability: string[],        // ["morning", "evening", "both"]
  cookingType: string[]          // ["veg", "non-veg"]
}
```

### Chef Filters

```javascript
{
  locations: string[],           // Distinct locations
  priceRange: {
    min: number,                 // Minimum price
    max: number                  // Maximum price
  },
  cuisine: string[],             // ["indian", "chinese", "italian", etc.]
  availability: string[]         // ["morning", "evening", "both", "full-time"]
}
```

### Tiffin Filters

```javascript
{
  locations: string[],           // Distinct locations
  priceRange: {
    min: number,                 // Minimum price
    max: number                  // Maximum price
  },
  foodType: string[],            // ["veg", "non-veg", "both"]
  mealType: string[],            // ["lunch", "dinner", "both"]
  deliveryAvailable: boolean[]   // [true, false]
}
```

### Hostel Filters

```javascript
{
  locations: string[],           // Distinct locations
  rentRange: {
    min: number,                 // Minimum rent
    max: number                  // Maximum rent
  },
  gender: string[],              // ["male", "female", "co-ed"]
  amenities: string[],           // Unique amenities from all hostels
  foodIncluded: boolean[]        // [true, false]
}
```

### Flat Filters

```javascript
{
  locations: string[],           // Distinct locations
  rentRange: {
    min: number,                 // Minimum rent
    max: number                  // Maximum rent
  },
  bhk: string[],                 // ["1RK", "1BHK", "2BHK", etc.]
  furnished: string[]            // ["fully-furnished", "semi-furnished", "unfurnished"]
}
```

---

## MongoDB Queries Used

### Distinct Values

```javascript
Model.distinct("location");
Model.distinct("availability");
Model.distinct("cuisine");
```

### Price/Rent Range (Aggregation)

```javascript
Model.aggregate([
  {
    $group: {
      _id: null,
      minPrice: { $min: "$price" },
      maxPrice: { $max: "$price" },
    },
  },
]);
```

### Array Field Aggregation (Amenities)

```javascript
Model.aggregate([
  { $unwind: "$amenities" },
  { $group: { _id: "$amenities" } },
  { $sort: { _id: 1 } },
]);
```

---

## Frontend Integration Example

### React Example

```javascript
// Fetch filters
const fetchFilters = async (type) => {
  const response = await fetch(`http://localhost:5000/api/filters/${type}`);
  const data = await response.json();

  if (data.success) {
    const { filters } = data.data;

    // Use filters to populate UI
    setLocations(filters.locations);
    setPriceRange(filters.priceRange || filters.rentRange);
    // ... set other filters
  }
};

// Usage
useEffect(() => {
  fetchFilters("chef");
}, []);
```

### Building Filter UI

```javascript
// Location dropdown
<select>
  {filters.locations.map(loc => (
    <option key={loc} value={loc}>{loc}</option>
  ))}
</select>

// Price range slider
<input
  type="range"
  min={filters.priceRange.min}
  max={filters.priceRange.max}
/>

// Cuisine checkboxes (for chef)
{filters.cuisine?.map(cuisine => (
  <label key={cuisine}>
    <input type="checkbox" value={cuisine} />
    {cuisine}
  </label>
))}
```

---

## Use Cases

### 1. Initialize Search Page

When user lands on search page, fetch filters to populate dropdowns and sliders:

```bash
GET /api/filters/chef
```

### 2. Dynamic Filter Updates

If user switches service type, fetch new filters:

```javascript
onTypeChange(newType) {
  fetchFilters(newType);
}
```

### 3. Price Range Slider

Use min/max from filters to set slider bounds:

```javascript
const { min, max } = filters.priceRange;
<Slider min={min} max={max} />;
```

### 4. Location Autocomplete

Use locations array for autocomplete suggestions:

```javascript
<Autocomplete options={filters.locations} />
```

---

## Performance Optimization

### Efficient Queries:

1. **distinct()**: Fast query for unique values
2. **Aggregation**: Single query for min/max calculation
3. **Sorted Results**: All arrays are sorted alphabetically
4. **Lean Operations**: No unnecessary data fetched

### Caching Recommendation:

Consider caching filter results on frontend:

```javascript
// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const cachedFilters = localStorage.getItem(`filters_${type}`);
```

---

## Testing Workflow

### Step 1: Test All Service Types

```bash
curl http://localhost:5000/api/filters/maid
curl http://localhost:5000/api/filters/chef
curl http://localhost:5000/api/filters/tiffin
curl http://localhost:5000/api/filters/hostel
curl http://localhost:5000/api/filters/flat
```

### Step 2: Verify Data Structure

Check that each response contains:

- locations array
- price/rent range object
- type-specific fields

### Step 3: Test Error Cases

```bash
curl http://localhost:5000/api/filters/invalid
curl http://localhost:5000/api/filters/
```

### Step 4: Verify Empty Database

If no data exists, should return:

```json
{
  "locations": [],
  "priceRange": { "min": 0, "max": 0 }
}
```

---

## Common Error Codes

- **200**: Success
- **400**: Bad request (invalid type)
- **500**: Internal server error

---

## Filter Fields by Type

| Service Type | Locations | Price/Rent | Type-Specific Fields                  |
| ------------ | --------- | ---------- | ------------------------------------- |
| Maid         | ✓         | price      | availability, cookingType             |
| Chef         | ✓         | price      | cuisine, availability                 |
| Tiffin       | ✓         | price      | foodType, mealType, deliveryAvailable |
| Hostel       | ✓         | rent       | gender, amenities, foodIncluded       |
| Flat         | ✓         | rent       | bhk, furnished                        |

---

## Quick Reference

### All Endpoints

```
GET /api/filters/maid
GET /api/filters/chef
GET /api/filters/tiffin
GET /api/filters/hostel
GET /api/filters/flat
```

### Response Format

```json
{
  "success": true,
  "message": "Filters fetched successfully",
  "data": {
    "filters": {
      // Dynamic fields based on type
    }
  }
}
```

---

## Implementation Details

### Controller Logic:

1. Validate type parameter
2. Select correct model
3. Execute parallel queries:
   - distinct() for categorical fields
   - aggregate() for price/rent range
   - aggregate() for array fields (amenities)
4. Sort all arrays alphabetically
5. Return structured filter data

### Models Used:

- `Maid` - For maid filters
- `Chef` - For chef filters
- `Tiffin` - For tiffin filters
- `Hostel` - For hostel filters
- `Flat` - For flat filters

### No Authentication:

- Public endpoint
- No JWT token required
- Anyone can fetch filters

---

## Notes

1. **Dynamic Data**: Filters are generated from actual database data
2. **Sorted Arrays**: All arrays are sorted alphabetically for consistency
3. **Empty Handling**: Returns empty arrays/zero values if no data exists
4. **Price vs Rent**: Automatically uses correct field (price for maid/chef/tiffin, rent for hostel/flat)
5. **Amenities**: Hostel amenities are flattened from array fields
6. **Boolean Fields**: Delivery and food included return [true, false] for UI checkboxes

---

## Sample Integration Flow

```javascript
// 1. User selects service type
const serviceType = "chef";

// 2. Fetch filters
const response = await fetch(`/api/filters/${serviceType}`);
const { data } = await response.json();

// 3. Populate UI
const filters = data.filters;

// 4. User applies filters and searches
const searchParams = {
  type: serviceType,
  location: selectedLocation,
  minPrice: filters.priceRange.min,
  maxPrice: selectedMaxPrice,
  cuisine: selectedCuisine,
};

// 5. Execute search
const results = await fetch(`/api/search?${new URLSearchParams(searchParams)}`);
```
