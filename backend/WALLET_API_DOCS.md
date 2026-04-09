# Wallet API Documentation

## Overview

The Wallet API allows users to manage their wallet balance. Users can check their balance and add money to their wallet.

---

## 📡 API Endpoints

### 1. Get Wallet Balance

**Endpoint:** `GET /api/users/wallet/balance/:userId`

**Description:** Get the wallet balance of a user

**Authentication:** Required (JWT token)

**URL Parameters:**

- `userId` (string, required) - MongoDB ObjectId of the user

**Headers:**

```http
Authorization: Bearer <token>
```

**Security:**

- Users can only access their own wallet balance
- Attempting to access another user's wallet returns 403 Forbidden

**Success Response (200):**

```json
{
  "success": true,
  "message": "Wallet balance fetched successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+919876543210",
    "walletBalance": 5000
  }
}
```

**Error Responses:**

**403 - Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized. You can only access your own wallet"
}
```

**404 - User Not Found:**

```json
{
  "success": false,
  "message": "User not found"
}
```

**Example Request:**

```bash
curl http://localhost:5000/api/users/wallet/balance/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <token>"
```

**Frontend Example:**

```javascript
const token = localStorage.getItem("authToken");
const user = JSON.parse(localStorage.getItem("user"));

const response = await fetch(`/api/users/wallet/balance/${user.id}`, {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();
if (data.success) {
  console.log("Wallet Balance:", data.data.walletBalance);
}
```

---

### 2. Add Money to Wallet

**Endpoint:** `POST /api/users/wallet/add`

**Description:** Add money to the authenticated user's wallet

**Authentication:** Required (JWT token)

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 1000
}
```

**Body Parameters:**

- `amount` (number, required) - Amount to add (must be > 0)

**Success Response (200):**

```json
{
  "success": true,
  "message": "₹1000 added to wallet successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+919876543210",
    "previousBalance": 5000,
    "amountAdded": 1000,
    "currentBalance": 6000
  }
}
```

**Error Responses:**

**400 - Missing Amount:**

```json
{
  "success": false,
  "message": "Amount is required"
}
```

**400 - Invalid Amount:**

```json
{
  "success": false,
  "message": "Amount must be a positive number greater than 0"
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
curl -X POST http://localhost:5000/api/users/wallet/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

**Frontend Example:**

```javascript
const token = localStorage.getItem("authToken");

const response = await fetch("/api/users/wallet/add", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 1000 }),
});

const data = await response.json();
if (data.success) {
  console.log("New Balance:", data.data.currentBalance);
  // Update local storage or state
}
```

---

## 🗄️ User Model Update

### New Field Added:

```javascript
walletBalance: {
  type: Number,
  default: 0,
  min: [0, "Wallet balance cannot be negative"]
}
```

**Properties:**

- Default value: 0
- Cannot be negative
- Automatically initialized for all users

---

## 🔒 Security Features

### Authorization:

- All wallet endpoints require JWT authentication
- Users can only access their own wallet
- Attempting to access another user's wallet returns 403

### Validation:

- Amount must be a positive number
- Amount must be greater than 0
- Wallet balance cannot go negative

### Data Protection:

- Wallet balance stored securely in database
- Only authorized user can view/modify their balance

---

## 💡 Use Cases

### 1. Display Wallet Balance:

```javascript
function WalletBalance() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(`/api/users/wallet/balance/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (data.success) {
      setBalance(data.data.walletBalance);
    }
  };

  return (
    <div>
      <h2>Wallet Balance</h2>
      <p>₹{balance}</p>
    </div>
  );
}
```

### 2. Add Money to Wallet:

```javascript
function AddMoney() {
  const [amount, setAmount] = useState("");

  const handleAddMoney = async () => {
    const token = localStorage.getItem("authToken");

    const response = await fetch("/api/users/wallet/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await response.json();
    if (data.success) {
      alert(`₹${amount} added successfully!`);
      setAmount("");
      // Refresh balance
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handleAddMoney}>Add Money</button>
    </div>
  );
}
```

### 3. Complete Wallet Component:

```javascript
function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const token = localStorage.getItem("authToken");
    const user = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(`/api/users/wallet/balance/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (data.success) {
      setBalance(data.data.walletBalance);
    }
  };

  const handleAddMoney = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("authToken");

    const response = await fetch("/api/users/wallet/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      setBalance(data.data.currentBalance);
      setAmount("");
      alert(data.message);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="wallet">
      <h2>My Wallet</h2>

      <div className="balance">
        <h3>Current Balance</h3>
        <p className="amount">₹{balance}</p>
      </div>

      <div className="add-money">
        <h3>Add Money</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="1"
        />
        <button onClick={handleAddMoney} disabled={loading}>
          {loading ? "Processing..." : "Add Money"}
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

### Test Get Balance:

```bash
# Get wallet balance
TOKEN="your-jwt-token"
USER_ID="your-user-id"

curl http://localhost:5000/api/users/wallet/balance/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Test Add Money:

```bash
# Add money to wallet
TOKEN="your-jwt-token"

curl -X POST http://localhost:5000/api/users/wallet/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

### PowerShell Test:

```powershell
# Get balance
$token = "your-jwt-token"
$userId = "your-user-id"

Invoke-RestMethod -Uri "http://localhost:5000/api/users/wallet/balance/$userId" `
  -Method GET `
  -Headers @{Authorization="Bearer $token"}

# Add money
$body = @{ amount = 1000 } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/wallet/add" `
  -Method POST `
  -Headers @{
    Authorization="Bearer $token"
    "Content-Type"="application/json"
  } `
  -Body $body
```

---

## 🎯 Future Enhancements

### 1. Transaction History:

- Track all wallet transactions
- Show transaction date, type, amount
- Filter by date range

### 2. Payment Gateway Integration:

- Integrate Razorpay/Stripe
- Real payment processing
- Payment verification

### 3. Withdraw Money:

- Allow users to withdraw to bank account
- Minimum withdrawal amount
- Withdrawal fees

### 4. Wallet Transactions Model:

```javascript
{
  userId: ObjectId,
  type: "credit" | "debit",
  amount: Number,
  description: String,
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: Date
}
```

---

## ✨ Summary

Your backend now has a simple wallet system:

✅ **Wallet Balance Field:** Added to User model (default: 0)
✅ **Get Balance API:** Users can check their wallet balance
✅ **Add Money API:** Users can add money to their wallet
✅ **Security:** Users can only access their own wallet
✅ **Validation:** Amount must be positive and greater than 0
✅ **Consistent Format:** All responses follow standard format
✅ **Production Ready:** Error handling, validation, security

The wallet system is ready to use and can be extended with payment gateway integration later!
