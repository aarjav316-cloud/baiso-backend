# Test Profile APIs - Quick Reference

## Prerequisites

1. Backend running on http://localhost:5000
2. User logged in with valid JWT token

## Step-by-Step Testing

### Step 1: Login and Get Token

```bash
# Request OTP
curl -X POST http://localhost:5000/api/users/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Login with OTP (use OTP from console)
curl -X POST http://localhost:5000/api/users/auth \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456",
    "name": "Test User",
    "city": "Mumbai"
  }'
```

**Save the token and userId from response!**

---

### Step 2: Test GET Profile

Replace `<TOKEN>` and `<USER_ID>` with actual values:

```bash
curl -X GET http://localhost:5000/api/users/profile/<USER_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Test User",
      "phone": "+919876543210",
      "city": "Mumbai",
      "role": "user",
      "isPhoneVerified": true,
      "authMethod": "otp"
    }
  }
}
```

---

### Step 3: Test UPDATE Profile

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "city": "Delhi"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Updated Name",
      "city": "Delhi",
      ...
    }
  }
}
```

**Test Validation:**

```bash
# Test with no fields (should fail)
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test with only name
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Only Name"}'

# Test with only city
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"city": "Only City"}'
```

---

### Step 4: Test DELETE Account

⚠️ **WARNING:** This will permanently delete the user account!

```bash
curl -X DELETE http://localhost:5000/api/users/account \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "deletedUser": {
      "id": "...",
      "name": "Updated Name",
      "phone": "+919876543210"
    }
  }
}
```

**Verify deletion:**

```bash
# Try to get profile again (should fail with 404)
curl -X GET http://localhost:5000/api/users/profile/<USER_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Test Error Cases

### 1. No Token (401 Unauthorized)

```bash
curl -X GET http://localhost:5000/api/users/profile/<USER_ID>
```

### 2. Invalid Token (401 Unauthorized)

```bash
curl -X GET http://localhost:5000/api/users/profile/<USER_ID> \
  -H "Authorization: Bearer invalid-token"
```

### 3. Invalid User ID (400 Bad Request)

```bash
curl -X GET http://localhost:5000/api/users/profile/invalid-id \
  -H "Authorization: Bearer <TOKEN>"
```

### 4. User Not Found (404 Not Found)

```bash
curl -X GET http://localhost:5000/api/users/profile/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <TOKEN>"
```

### 5. Invalid Name Length (400 Bad Request)

```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "A"}'
```

---

## Postman/Thunder Client Collection

### 1. Create Environment Variables

- `baseUrl`: http://localhost:5000
- `token`: (set after login)
- `userId`: (set after login)

### 2. Import Requests

**Login:**

```
POST {{baseUrl}}/api/users/auth
Body: {
  "phone": "+919876543210",
  "otp": "123456",
  "name": "Test User",
  "city": "Mumbai"
}
```

**Get Profile:**

```
GET {{baseUrl}}/api/users/profile/{{userId}}
Headers: Authorization: Bearer {{token}}
```

**Update Profile:**

```
PUT {{baseUrl}}/api/users/profile
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body: {
  "name": "Updated Name",
  "city": "Delhi"
}
```

**Delete Account:**

```
DELETE {{baseUrl}}/api/users/account
Headers: Authorization: Bearer {{token}}
```

---

## Frontend Testing (Browser Console)

```javascript
// 1. Login first and get token
const loginResponse = await fetch("/api/users/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "+919876543210",
    otp: "123456",
    name: "Test User",
    city: "Mumbai",
  }),
});
const loginData = await loginResponse.json();
const token = loginData.data.token;
const userId = loginData.data.user.id;

// 2. Get Profile
const profileResponse = await fetch(`/api/users/profile/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const profileData = await profileResponse.json();
console.log("Profile:", profileData);

// 3. Update Profile
const updateResponse = await fetch("/api/users/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Updated Name",
    city: "Delhi",
  }),
});
const updateData = await updateResponse.json();
console.log("Updated:", updateData);

// 4. Delete Account (careful!)
const deleteResponse = await fetch("/api/users/account", {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
const deleteData = await deleteResponse.json();
console.log("Deleted:", deleteData);
```

---

## Expected Status Codes

| Endpoint       | Success | Error Cases                                      |
| -------------- | ------- | ------------------------------------------------ |
| GET Profile    | 200     | 400 (invalid ID), 401 (no auth), 404 (not found) |
| UPDATE Profile | 200     | 400 (validation), 401 (no auth), 404 (not found) |
| DELETE Account | 200     | 401 (no auth), 404 (not found)                   |

---

## Checklist

- [ ] Backend server running
- [ ] Redis running
- [ ] MongoDB running
- [ ] User created and logged in
- [ ] Token saved
- [ ] GET profile works
- [ ] UPDATE profile works
- [ ] DELETE account works
- [ ] Error cases handled correctly
- [ ] Frontend integration tested

---

## Quick PowerShell Test Script

Save as `test-profile-apis.ps1`:

```powershell
$baseUrl = "http://localhost:5000"
$phone = "+919876543210"

# 1. Request OTP
Write-Host "1. Requesting OTP..." -ForegroundColor Yellow
$otpResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/request-otp" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{phone=$phone} | ConvertTo-Json)
Write-Host "OTP: $($otpResponse.data.otp)" -ForegroundColor Green

# 2. Login
$otp = Read-Host "Enter OTP"
Write-Host "2. Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/auth" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    phone=$phone
    otp=$otp
    name="Test User"
    city="Mumbai"
  } | ConvertTo-Json)

$token = $loginResponse.data.token
$userId = $loginResponse.data.user.id
Write-Host "Token: $token" -ForegroundColor Green
Write-Host "User ID: $userId" -ForegroundColor Green

# 3. Get Profile
Write-Host "3. Getting profile..." -ForegroundColor Yellow
$profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/profile/$userId" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}
Write-Host ($profileResponse | ConvertTo-Json -Depth 10) -ForegroundColor Cyan

# 4. Update Profile
Write-Host "4. Updating profile..." -ForegroundColor Yellow
$updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" `
  -Method PUT `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body (@{
    name="Updated Name"
    city="Delhi"
  } | ConvertTo-Json)
Write-Host ($updateResponse | ConvertTo-Json -Depth 10) -ForegroundColor Cyan

Write-Host "All tests completed!" -ForegroundColor Green
```

Run with: `.\test-profile-apis.ps1`
