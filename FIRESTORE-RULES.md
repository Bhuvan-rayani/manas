# 🔐 Firestore Rules Setup for Manas Split

## ⚠️ Current Error: "Missing or insufficient permissions"

This means your Firestore Security Rules are blocking database writes.

## ✅ Quick Fix (Copy-Paste Solution)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Click on your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top

### Step 2: Replace ALL existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow everything (DEVELOPMENT ONLY - not for production)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Click the orange **Publish** button

### Step 4: Wait 10 seconds, then try creating your PS board again

---

## 🎯 What This Does

- Allows reading and writing to **all** Firestore collections
- Perfect for development and testing
- You can restrict permissions later when deploying to production

---

## Production Rules (Recommended)

For production, use these rules that allow proper access to both trips and PS boards:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Trips collection
    match /trips/{tripId} {
      allow read, write: if true;
    }
    
    // Expenses linked to trips
    match /expenses/{expenseId} {
      allow read, write: if true;
    }
    
    // Settlements linked to trips
    match /settlements/{settlementId} {
      allow read, write: if true;
    }
    
    // PS Boards collection (separate from trips)
    match /ps_boards/{psId} {
      allow read, write: if true;
      
      // Products under PS boards
      match /products/{productId} {
        allow read, write: if true;
      }
    }
    
    // Users
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

## Data Structure

### Trips (for expenses/balances)
```
trips/
  {tripId}/
    - name, participants, memberAvatars, createdAt

expenses/
  {expenseId}/
    - tripId (reference), amount, paidBy, splitBetween, etc.

settlements/
  {settlementId}/
    - tripId (reference), from, to, amount, isPaid, etc.
```

### PS Boards (for product tracking)
```
ps_boards/
  {psId}/
    - name, participants, memberAvatars, createdAt
    products/
      {productId}/
        - serialNumber, itemName, quantity, status, etc.
```

## How to Apply

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** (left sidebar)
4. Click **Rules** tab
5. Paste the rules above
6. Click **Publish**

## Testing

After publishing rules, try:
- Creating a new PS board
- Adding a product
- The error should be gone!

## Security Note

The rules above use `if true` which allows anyone to read/write. For production apps with authentication, replace with proper security checks based on your auth system.
