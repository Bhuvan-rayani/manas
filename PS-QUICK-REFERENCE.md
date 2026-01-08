# PS Feature Quick Start Guide

## What is PS (Product Serial)?
PS stands for Product Serial - a tracking system for managing products/purchases with:
- Unique serial numbers (PS-001, PS-002, etc.)
- Person tracking with avatars
- Status management (PR Sent → Ordered → Delivered)
- Price tracking
- Complete audit trail

## Quick Steps

### 1. Add a Product
```
Dashboard → Products (PS) Tab → Add Product Button
Fill in: Serial # | Item Name | Quantity | Added By | Status | Details
```

### 2. Update Status
```
Click on Status → Select New Status → Click ✓
```

### 3. View Products
- Table view with all details
- Click "Link" to open product URL
- Delete items as needed

### 4. View Statistics
- Product count displayed in header
- Filter by person, subsystem, or status using PS API

## Database Collections

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| products | Store all products | serialNumber, tripId, status |
| trips | Trip info | participants, memberAvatars |
| expenses | Expense tracking | tripId, amount, paidBy |
| settlements | Payment tracking | tripId, from, to, amount |

## Important Files

| File | Purpose |
|------|---------|
| types.ts | ProductItem interface & ProductStatus type |
| ProductForm.tsx | Add/Edit product UI |
| ProductList.tsx | Display products table |
| ps-api.ts | Query and access functions |
| db.ts | Firebase CRUD operations |

## Status Workflow

```
PR Sent → Ordered → Delivered ✓
           ↓
         Out of Stock ✗
       (or Pending)
```

## API Examples

### Get all products
```typescript
import { getAllProductsInTrip } from './services/ps-api';
const products = await getAllProductsInTrip(tripId);
```

### Get by serial number
```typescript
import { getProductBySerialNumber } from './services/ps-api';
const product = await getProductBySerialNumber(tripId, 'PS-001');
```

### Get by status
```typescript
import { getProductsByStatus } from './services/ps-api';
const delivered = await getProductsByStatus(tripId, 'Delivered');
```

### Get by person (who added it)
```typescript
import { getProductsByPerson } from './services/ps-api';
const items = await getProductsByPerson(tripId, 'Yash');
```

### Get statistics
```typescript
import { getProductStats } from './services/ps-api';
const stats = await getProductStats(tripId);
console.log(`Total value: ₹${stats.totalValue}`);
console.log(`Delivered: ${stats.byStatus['Delivered']}`);
```

### Export as CSV
```typescript
import { exportProductsAsCSV } from './services/ps-api';
const csv = await exportProductsAsCSV(tripId);
// Save or download CSV
```

### Generate Report
```typescript
import { generateProductReport } from './services/ps-api';
const report = await generateProductReport(tripId);
console.log(report);
```

## Features

✅ Serial Number Tracking (PS)  
✅ Person Attribution with Avatars  
✅ Multi-stage Status Workflow  
✅ Price & Quantity Management  
✅ Subsystem Organization  
✅ Notes & Comments  
✅ Product Links  
✅ Real-time Sync (Firebase)  
✅ CSV Export  
✅ Report Generation  
✅ Advanced Filtering & Querying  

## Access Layer

The PS API (`ps-api.ts`) provides abstraction for:
- Real-time data subscription
- Advanced filtering
- Statistics generation
- Data export
- Report generation

**No direct Firestore queries needed** - use PS API instead!

## Tab Navigation

**💰 Expenses Tab**: Track trip expenses & settlements  
**📦 Products (PS) Tab**: Manage product orders & inventory  

Switch between tabs using the buttons at the top of the dashboard.

## Adding Avatars

1. Go to Onboarding when creating a trip
2. Select avatar for each participant
3. Avatars appear next to names in product "Added By" field
4. Track who added each product visually

## Common Tasks

### Track a purchase from request to delivery
1. Add product with status "PR Sent"
2. When order placed → Update to "Ordered"
3. When received → Update to "Delivered"
4. View complete history in table

### Budget tracking
```typescript
const stats = await getProductStats(tripId);
// stats.totalValue = sum of all totalPrice fields
```

### Find items by team member
```typescript
const teamItems = await getProductsByPerson(tripId, 'TeamMemberName');
// See everything they added
```

### Organize by subsystem
```typescript
const mechanics = await getProductsBySubsystem(tripId, 'Mech');
const electronics = await getProductsBySubsystem(tripId, 'Elec');
// Keep track by department/subsystem
```

## Integration

### Used In:
- Main App.tsx dashboard
- Tab-based navigation system
- Real-time Firebase sync

### Exports:
- ProductForm component
- ProductList component
- ps-api service functions
- ProductItem types

## Notes
- All data tied to tripId for isolation
- Real-time updates via Firestore subscriptions
- Sorted by serial number by default
- Status editable inline in table
- Full audit trail with timestamps
