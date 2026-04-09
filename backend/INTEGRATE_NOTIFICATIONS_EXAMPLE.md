# Integrating Notifications with Existing Controllers

This guide shows how to add real-time notifications to your existing booking, payment, and review controllers.

---

## 1. Update Booking Controller

**File:** `backend/src/controllers/booking.controller.js`

### Import Notification Helpers

Add at the top of the file:

```javascript
import {
  notifyBookingCreated,
  notifyBookingStatusUpdate,
  notifyBookingCancelled,
} from "../utils/notificationHelper.js";
```

### Update createBooking Function

Add notification after booking is created:

```javascript
export const createBooking = async (req, res) => {
  try {
    // ... existing booking creation logic ...

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      providerId,
      itemId,
      type,
      status: "pending",
      notes: notes || "",
    });

    // Populate user and provider details
    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    // ✨ NEW: Send notification to provider
    const io = req.app.get("io");
    await notifyBookingCreated(io, populatedBooking);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

### Update updateBookingStatus Function

Add notification after status update:

```javascript
export const updateBookingStatus = async (req, res) => {
  try {
    // ... existing status update logic ...

    // Update status
    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    // ✨ NEW: Send notification to user
    const io = req.app.get("io");
    await notifyBookingStatusUpdate(io, updatedBooking, status);

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updatedBooking,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

### Update cancelBooking Function

Add notification after cancellation:

```javascript
export const cancelBooking = async (req, res) => {
  try {
    // ... existing cancellation logic ...

    // Update status to cancelled
    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("userId", "name phone city")
      .populate("providerId", "name phone city");

    // ✨ NEW: Send notification to provider
    const io = req.app.get("io");
    await notifyBookingCancelled(io, updatedBooking);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 2. Update User Controller (Wallet)

**File:** `backend/src/controllers/user.controller.js`

### Import Notification Helper

```javascript
import { notifyPaymentReceived } from "../utils/notificationHelper.js";
```

### Update addMoney Function

Add notification after money is added:

```javascript
export const addMoney = async (req, res) => {
  try {
    // ... existing add money logic ...

    // Update wallet balance
    user.walletBalance += amountNum;
    await user.save();

    // ✨ NEW: Send notification to user
    const io = req.app.get("io");
    await notifyPaymentReceived(io, user._id, amountNum);

    return res.status(200).json({
      success: true,
      message: "Money added successfully",
      data: {
        walletBalance: user.walletBalance,
        amountAdded: amountNum,
      },
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 3. Update Review Controller

**File:** `backend/src/controllers/review.controller.js`

### Import Notification Helper

```javascript
import { notifyReviewAdded } from "../utils/notificationHelper.js";
```

### Update addReview Function

Add notification after review is added:

```javascript
export const addReview = async (req, res) => {
  try {
    // ... existing review creation logic ...

    // Create review
    const review = await Review.create({
      userId: req.user._id,
      itemId,
      type: type.toLowerCase(),
      rating: ratingNum,
      comment: comment.trim(),
    });

    // Populate user details
    const populatedReview = await Review.findById(review._id).populate(
      "userId",
      "name city",
    );

    // Get provider ID from the service
    let providerId;
    switch (type.toLowerCase()) {
      case "chef":
        const chef = await Chef.findById(itemId);
        providerId = chef.userId;
        break;
      case "tiffin":
        const tiffin = await Tiffin.findById(itemId);
        providerId = tiffin.userId;
        break;
      case "hostel":
        const hostel = await Hostel.findById(itemId);
        providerId = hostel.userId;
        break;
      case "flat":
        const flat = await Flat.findById(itemId);
        providerId = flat.userId;
        break;
    }

    // ✨ NEW: Send notification to provider
    if (providerId) {
      const io = req.app.get("io");
      await notifyReviewAdded(io, providerId, req.user.name, ratingNum);
    }

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: populatedReview,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 4. Custom Notifications

You can also create custom notifications for specific events:

### Example: Welcome Notification

```javascript
import { notifySystem } from "../utils/notificationHelper.js";

export const register = async (req, res) => {
  try {
    // ... user registration logic ...

    // Create user
    const user = await User.create({...});

    // ✨ Send welcome notification
    const io = req.app.get("io");
    await notifySystem(
      io,
      user._id,
      "Welcome to Baiso! Start exploring services now.",
      { isWelcome: true }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

### Example: Service Approved Notification

```javascript
import { notifySystem } from "../utils/notificationHelper.js";

export const approveService = async (req, res) => {
  try {
    // ... service approval logic ...

    // ✨ Notify provider
    const io = req.app.get("io");
    await notifySystem(
      io,
      providerId,
      "Your service has been approved and is now live!",
      { serviceId, serviceType },
    );

    return res.status(200).json({
      success: true,
      message: "Service approved successfully",
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 5. Testing the Integration

### Step 1: Start Server

```bash
npm run dev
```

### Step 2: Connect Frontend to Socket.IO

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: yourJWTToken },
});

socket.on("notification", (notification) => {
  console.log("Received notification:", notification);
  showToast(notification.message);
});
```

### Step 3: Trigger an Event

Create a booking, update status, add money, or add a review.

### Step 4: Verify Notification

- Check console for real-time notification
- Check database for saved notification
- Fetch notifications via API

---

## 6. Complete Example: Booking Flow

```javascript
// User creates booking
POST /api/bookings/create
→ Provider receives notification: "New booking request from John"

// Provider accepts booking
PUT /api/bookings/:id/status { status: "accepted" }
→ User receives notification: "Your booking has been accepted"

// User cancels booking
POST /api/bookings/cancel
→ Provider receives notification: "Booking cancelled by John"
```

---

## 7. Error Handling

Always wrap notification calls in try-catch to prevent failures from breaking main logic:

```javascript
try {
  const io = req.app.get("io");
  await notifyBookingCreated(io, booking);
} catch (notificationError) {
  // Log error but don't fail the request
  console.error("Failed to send notification:", notificationError);
}
```

Or use the built-in error handling in notification helpers (already implemented).

---

## 8. Notification Best Practices

### DO:

✓ Send notifications for important events
✓ Keep messages clear and concise
✓ Include relevant metadata
✓ Use appropriate notification types
✓ Handle errors gracefully

### DON'T:

✗ Send too many notifications (spam)
✗ Include sensitive data in messages
✗ Block main logic if notification fails
✗ Send notifications for trivial events
✗ Forget to test offline scenarios

---

## 9. Monitoring Notifications

### Check Connected Users

```javascript
import { getConnectedUsers, isUserOnline } from "../configs/socket.js";

// Get all online users
const onlineUsers = getConnectedUsers();
console.log("Online users:", onlineUsers);

// Check if specific user is online
const isOnline = isUserOnline(userId);
console.log(`User ${userId} is ${isOnline ? "online" : "offline"}`);
```

### Log Notification Delivery

The notification helpers already log delivery status:

```
Notification sent to user 507f1f77bcf86cd799439013
User 507f1f77bcf86cd799439014 is offline, notification saved in DB
```

---

## 10. Summary

After integration, your system will:

1. ✓ Send real-time notifications for bookings
2. ✓ Notify users of status changes
3. ✓ Alert providers of new bookings
4. ✓ Notify users of payments
5. ✓ Alert providers of new reviews
6. ✓ Save all notifications in database
7. ✓ Support offline users
8. ✓ Provide notification management APIs

---

## Quick Integration Checklist

- [ ] Import notification helpers in controllers
- [ ] Get `io` instance using `req.app.get("io")`
- [ ] Call notification functions after events
- [ ] Test with Socket.IO client
- [ ] Verify notifications in database
- [ ] Test offline scenario
- [ ] Update frontend to display notifications
- [ ] Add notification badge/count
- [ ] Implement notification sounds (optional)
- [ ] Deploy and monitor

---

## Need Help?

- Check `TEST_NOTIFICATIONS_API.md` for API documentation
- Review `NOTIFICATIONS_IMPLEMENTATION_SUMMARY.md` for architecture
- See `INSTALL_SOCKETIO.md` for setup instructions
- Check `notificationHelper.js` for available functions
