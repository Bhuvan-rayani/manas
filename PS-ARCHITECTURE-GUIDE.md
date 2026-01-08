# PS Feature - Visual Guide & Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Main)                          │
│  - State: products[], activeTab ('expenses'|'products')    │
│  - Subscriptions: subscribeToProducts()                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Tab Navigation      ProductForm & ProductList
   [Expenses]          - Add products (modal)
   [Products PS]       - Display table
        │               - Inline editing
        └───────┬───────┘
                │
        ┌───────▼──────────────────────────┐
        │   Database Layer (db.ts)         │
        ├───────────────────────────────────┤
        │ CRUD Functions:                  │
        │ • createProductItem()            │
        │ • subscribeToProducts()          │
        │ • updateProductItem()           │
        │ • deleteProductItem()           │
        │ • getProductsBySerialNumber()   │
        │ • getAllProducts()              │
        └───────┬──────────────────────────┘
                │
        ┌───────▼──────────────────────────┐
        │   PS API Layer (ps-api.ts)       │
        ├───────────────────────────────────┤
        │ Query Functions:                 │
        │ • getAllProductsInTrip()        │
        │ • getProductBySerialNumber()    │
        │ • getProductsByStatus()         │
        │ • getProductsByPerson()         │
        │ • getProductsBySubsystem()      │
        │ • getProductStats()             │
        │ • exportProductsAsCSV()         │
        │ • generateProductReport()       │
        └───────┬──────────────────────────┘
                │
        ┌───────▼──────────────────────────┐
        │   Firebase Firestore            │
        ├───────────────────────────────────┤
        │ Collection: products            │
        │ - Real-time subscriptions       │
        │ - CRUD operations               │
        │ - Data persistence              │
        └───────────────────────────────────┘
```

## 📊 Data Flow

### Adding a Product
```
User fills form
    ↓
ProductForm validates
    ↓
createProductItem(tripId, data)
    ↓
Add to Firestore
    ↓
subscribeToProducts() triggered
    ↓
App.tsx products state updates
    ↓
ProductList re-renders
    ↓
Product appears in table
```

### Updating Status
```
User clicks status in table
    ↓
Inline dropdown appears
    ↓
User selects new status
    ↓
Click ✓ button
    ↓
updateProductItem(productId, {status: newStatus})
    ↓
Firestore updates
    ↓
Subscription updates App state
    ↓
Table re-renders with new status
```

## 🎨 UI Component Hierarchy

```
App.tsx
├── Dashboard Header
├── Tab Navigation
│   ├── 💰 Expenses Tab (active/inactive)
│   └── 📦 Products PS Tab (active/inactive)
│
├── Balances Section (always visible)
│   └── Balance Cards Grid
│
├── Settlements Section (always visible)
│   └── Settlement Table
│
├── Content Section (changes based on active tab)
│   │
│   ├── IF activeTab === 'expenses':
│   │   ├── Recent Expenses Header
│   │   ├── Add Expense Button
│   │   └── ExpenseList (or empty state)
│   │
│   └── IF activeTab === 'products':
│       ├── Product Tracking Header
│       ├── Add Product Button
│       └── ProductList
│           ├── Products Table
│           │   ├── Serial Number (PS)
│           │   ├── Item Name
│           │   ├── Quantity
│           │   ├── Added By (with avatar)
│           │   ├── Subsystem
│           │   ├── Status (editable)
│           │   ├── Price
│           │   └── Actions
│           └── Product Notes Section
│
├── Floating Action Button (context-aware)
│   └── Opens ExpenseForm or ProductForm
│
├── ProductForm Modal (when showing)
│   ├── Serial Number Input
│   ├── Item Name Input
│   ├── Quantity Input
│   ├── Added By Dropdown
│   ├── Status Dropdown
│   ├── Subsystem Input
│   ├── Price Inputs
│   ├── Link Input
│   ├── Comments Textarea
│   ├── Submit Button
│   └── Close Button
│
└── IndividualBoard Modal (optional)
    └── Person details
```

## 🔄 Component Communication

```
┌──────────────┐
│   App.tsx    │
│              │
│ products[],  │
│ activeTab    │
└──────┬───────┘
       │
       ├─────────────────────────────┬──────────────────┐
       │                             │                  │
       ▼                             ▼                  ▼
   ProductForm               ProductList         (other components)
   (Modal)                   (Table)
   
   ├─ Pass tripId            ├─ Pass products
   ├─ Pass participants      ├─ Pass trip
   ├─ Pass trip              ├─ Pass onUpdate
   ├─ onClose callback       └─ onDelete callback
   │
   └─ Calls:
      createProductItem()
      onClose()
```

## 📱 Screen Layout

### Dashboard (with tabs)
```
┌─────────────────────────────────────────────────────────┐
│ Header (Manas Split, Back, Profile)                    │
├─────────────────────────────────────────────────────────┤
│ Dashboard Title                                          │
├─────────────────────────────────────────────────────────┤
│ [💰 Expenses] [📦 Products PS]                          │ Tab Navigation
├─────────────────────────────────────────────────────────┤
│                                                          │
│ BALANCES SECTION                                         │
│ ┌──────────┬──────────┬──────────┬──────────────────┐  │
│ │ Person 1 │ Person 2 │ Person 3 │ Person 4        │  │
│ │ Balance  │ Balance  │ Balance  │ Balance         │  │
│ └──────────┴──────────┴──────────┴──────────────────┘  │
│                                                          │
│ SETTLEMENTS SECTION                                      │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Settlement details...                               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ CONTENT SECTION (changes by tab)                        │
│                                                          │
│ IF PRODUCTS TAB ACTIVE:                                 │
│ ┌────────────────────────────────────┐                 │
│ │ Product Tracking (PS)  [Add] Btn   │                 │
│ ├────────────────────────────────────┤                 │
│ │ PS   │ Item │ Qty │ By │ System    │                 │
│ │ Status │ Price │ Action │          │                 │
│ ├─────────────────────────────────────┤                 │
│ │ PS-001 │ Heat Gun │ 2 │ Avatar    │                 │
│ │ PR Sent│ ₹7000  │ [Link][Del]     │                 │
│ ├─────────────────────────────────────┤                 │
│ │ (more products...)                  │                 │
│ └────────────────────────────────────┘                 │
│                                                          │
│ PRODUCT NOTES SECTION                                   │
│ ┌────────────────────────────────────┐                 │
│ │ PS-001: Heat Gun - Test note...    │                 │
│ │ PS-003: Motor - Urgent item!       │                 │
│ └────────────────────────────────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
                                              [+] FAB
```

## 🔍 File Dependencies

```
App.tsx
├── imports ProductForm from components/ProductForm.tsx
├── imports ProductList from components/ProductList.tsx
├── imports subscribeToProducts from services/db.ts
├── imports ProductItem, ProductStatus from types.ts
│
types.ts
├── ProductItem interface
└── ProductStatus type

ProductForm.tsx
├── imports ProductStatus, Trip from types.ts
├── imports createProductItem from services/db.ts
├── imports AVATARS from assets/avatars.ts
├── imports RupeeSymbol from CurrencyIcon.tsx
│
ProductList.tsx
├── imports ProductItem, Trip, ProductStatus from types.ts
├── imports AVATARS from assets/avatars.ts
├── imports updateProductItem, deleteProductItem from services/db.ts
├── imports RupeeSymbol from CurrencyIcon.tsx

services/db.ts
├── imports ProductItem from types.ts
├── Firebase functions (Firestore & Storage)

services/ps-api.ts
├── imports ProductItem, ProductStatus from types.ts
├── imports getAllProducts, getProductsBySerialNumber, etc. from db.ts
```

## 🎯 Data Models

### ProductItem
```typescript
{
  id: "doc-id",              // Auto-generated by Firebase
  tripId: "trip-123",        // References trip
  serialNumber: "PS-001",    // Unique identifier
  itemName: "Heat Gun",      // Product name
  quantity: 2,               // Units
  link: "https://...",       // Purchase URL
  subsystem: "SnA",          // Category
  addedBy: "Yash",           // Person
  status: "PR Sent",         // One of 5 statuses
  pricePerUnit: 3500,        // ₹ per unit
  totalPrice: 7000,          // ₹ total
  comments: "Urgent item",   // Notes
  createdAt: 1704693600000,  // Timestamp
  updatedAt: 1704693600000   // Timestamp
}
```

### ProductStatus
```typescript
type ProductStatus = 
  | 'PR Sent'        // Blue - Request sent
  | 'Ordered'        // Purple - Order placed
  | 'Delivered'      // Green - Received ✓
  | 'Out of Stock'   // Red - Unavailable
  | 'Pending'        // Yellow - Awaiting action
```

## 🔐 Data Flow Security

```
User Input (ProductForm)
    ↓
Validation (form validates)
    ↓
Type Checking (TypeScript)
    ↓
Database Layer (createProductItem)
    ↓
Firestore Rules (Firebase security)
    ↓
Storage (Firestore database)
    ↓
Real-time Listener (subscribeToProducts)
    ↓
App State (products[])
    ↓
Component Render (ProductList)
    ↓
User Display
```

## 🌐 State Management Flow

```
App.tsx Central State
│
├─ products: ProductItem[] 
│  ├─ Populated by subscribeToProducts()
│  ├─ Updated when Firebase changes
│  └─ Passed to ProductList
│
├─ activeTab: 'expenses' | 'products'
│  ├─ Controls which component shows
│  ├─ Updated by tab click handlers
│  └─ Affects FAB behavior
│
├─ showProductForm: boolean
│  ├─ Controls ProductForm modal visibility
│  ├─ Updated by open/close handlers
│  └─ Passed to ProductForm as onClose
│
└─ Other states: trip, expenses, settlements...
   (unchanged from original implementation)
```

## 🎁 Integration Points

```
Existing Features          New PS Feature
│                          │
├─ Trip Management    ────→ Uses tripId
├─ User Avatars      ────→ Used for "Added By"
├─ Tab Navigation    ────→ New tab for products
├─ Firebase Config   ────→ Products collection
├─ Styling (Tailwind) ───→ UI components
└─ Components (React) ───→ ProductForm, ProductList
```

## 📈 Scalability

```
Products per trip: Unlimited
  - Firebase handles thousands
  - Client-side sorting by serial #
  - Efficient subscriptions

Memory usage:
  - Only subscribed trip's products
  - Unsubscribes on trip change
  - Lazy loading not needed

Performance:
  - Firestore indexes on tripId
  - Efficient real-time updates
  - No excessive re-renders
```

## 🚀 Deployment Checklist

- ✅ All TypeScript types defined
- ✅ No runtime errors
- ✅ Firebase collection ready
- ✅ Real-time subscriptions working
- ✅ CRUD operations functional
- ✅ UI components complete
- ✅ API layer abstraction done
- ✅ Documentation complete
- ✅ Testing guide provided
- ✅ Ready for production

---

This visual guide shows how all components work together to create a complete product tracking system!
