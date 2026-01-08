# PS (Product Serial) Tracking Feature

## Overview
The PS (Product Serial) tracking system allows you to manage and track all products/purchases for your project. Each product has a unique serial number (PS) and can be tracked through various stages of its lifecycle.

## Features

### 1. **Product Serial Number (PS)**
- Each product gets a unique identifier (e.g., PS-001, PS-002)
- Automatically sorted and indexed for easy lookup
- Used as the primary reference for tracking

### 2. **Product Information**
- **Item Name**: Name of the product
- **Quantity**: How many units are being ordered
- **Status**: Current state of the product (see Status Options below)
- **Added By**: Person who added the product with avatar display
- **Subsystem**: Category or subsystem (e.g., SnA, Mech, Elec)
- **Price Per Unit**: Cost of individual unit
- **Total Price**: Total cost (quantity × price per unit)
- **Product Link**: Purchase link or reference URL
- **Comments**: Additional notes or details

### 3. **Status Options**
Products can have the following statuses:
- **PR Sent**: Purchase request has been sent
- **Ordered**: Item has been ordered
- **Delivered**: Item has been received
- **Out of Stock**: Item is not available
- **Pending**: Awaiting action

### 4. **Person Tracking with Avatars**
- See who added each product with their avatar
- Track contributions by team member
- Easy identification with visual avatars

## How to Use

### Adding a Product
1. Navigate to the **Products (PS)** tab in the dashboard
2. Click **"Add Product"** button
3. Fill in the product details:
   - Serial Number (PS-001, etc.)
   - Item Name
   - Quantity
   - Who is adding it (dropdown with avatars)
   - Status (default: PR Sent)
   - Subsystem (optional)
   - Price information (optional)
   - Product link (optional)
   - Comments (optional)
4. Click **"Add Product"**

### Updating Status
1. Click on the **Status** field for any product
2. Select the new status from the dropdown
3. Click the **✓** button to confirm

### Viewing Product Details
- All products are displayed in an interactive table
- Click **Link** button to visit the product URL
- View product notes in the "Product Notes" section below the table

### Deleting a Product
1. Click the **Delete** button for the product
2. Confirm the deletion

## Database Structure

### ProductItem Interface
```typescript
interface ProductItem {
  id: string;                  // Firebase document ID
  tripId: string;              // Associated trip ID
  serialNumber: string;        // PS - Product Serial
  itemName: string;            // Product name
  quantity: number;            // Quantity ordered
  link?: string;               // Product link
  subsystem?: string;          // Subsystem category
  addedBy: string;             // Person who added it
  status: ProductStatus;       // Current status
  pricePerUnit?: number;       // Cost per unit
  totalPrice?: number;         // Total cost
  comments?: string;           // Additional notes
  createdAt: number;           // Timestamp created
  updatedAt?: number;          // Timestamp updated
}
```

## PS API - Access Functions

### Import PS API
```typescript
import {
  getAllProductsInTrip,
  getProductBySerialNumber,
  getProductsByStatus,
  getProductsByPerson,
  getProductsBySubsystem,
  getProductStats,
  exportProductsAsCSV,
  generateProductReport
} from './services/ps-api';
```

### Available Functions

#### 1. Get All Products
```typescript
const products = await getAllProductsInTrip(tripId);
// Returns array of all products in trip
```

#### 2. Get Product by Serial Number
```typescript
const product = await getProductBySerialNumber(tripId, 'PS-001');
// Returns single product or null if not found
```

#### 3. Get Products by Status
```typescript
const delivered = await getProductsByStatus(tripId, 'Delivered');
// Returns all products with specified status
```

#### 4. Get Products by Person
```typescript
const addedByYash = await getProductsByPerson(tripId, 'Yash');
// Returns all products added by specific person
```

#### 5. Get Products by Subsystem
```typescript
const mechProducts = await getProductsBySubsystem(tripId, 'Mech');
// Returns all products in specified subsystem
```

#### 6. Get Product Statistics
```typescript
const stats = await getProductStats(tripId);
// Returns:
// {
//   totalProducts: number,
//   totalQuantity: number,
//   totalValue: number,
//   byStatus: { statusName: count },
//   byPerson: { personName: count },
//   bySubsystem: { subsystemName: count }
// }
```

#### 7. Export as CSV
```typescript
const csv = await exportProductsAsCSV(tripId);
// Returns CSV formatted string ready to download
```

#### 8. Generate Report
```typescript
const report = await generateProductReport(tripId);
// Returns formatted text report with all details
```

## Database Collections

### Products Collection
- **Collection Name**: `products`
- **Documents**: ProductItem objects
- **Indexed by**: `tripId` (for querying)

## Components

### ProductForm.tsx
- Modal form for adding new products
- All fields with validation
- Avatar selection for "Added By"
- Status dropdown

### ProductList.tsx
- Table view of all products
- Inline status editing
- Action buttons (Link, Delete)
- Product notes section
- Responsive design

## Database Functions (db.ts)

```typescript
// Create a new product
createProductItem(tripId, productData)

// Subscribe to real-time product updates
subscribeToProducts(tripId, callback)

// Update product details
updateProductItem(productId, updates)

// Delete a product
deleteProductItem(productId)

// Get product by serial number
getProductsBySerialNumber(tripId, serialNumber)

// Get all products in trip
getAllProducts(tripId)
```

## Integration Points

### App.tsx
- Tab navigation between Expenses and Products
- Products state management
- ProductForm and ProductList integration
- Floating action button for quick add

### Types.ts
- ProductItem interface
- ProductStatus type ('PR Sent', 'Ordered', 'Delivered', 'Out of Stock', 'Pending')

### Firebase
- All products stored in Firestore
- Real-time synchronization
- Trip-based data isolation

## Usage Examples

### Example 1: Track Item Status
```typescript
// Get all pending items
const pending = await getProductsByStatus(tripId, 'Pending');
console.log(`${pending.length} items waiting`);
```

### Example 2: Generate Inventory Report
```typescript
// Get complete inventory
const stats = await getProductStats(tripId);
console.log(`Total inventory value: ₹${stats.totalValue}`);
console.log(`Delivered items: ${stats.byStatus['Delivered']}`);
```

### Example 3: Find Items by Subsystem
```typescript
// Get all mechanical subsystem items
const mechanical = await getProductsBySubsystem(tripId, 'Mech');
mechanical.forEach(item => {
  console.log(`${item.serialNumber}: ${item.itemName}`);
});
```

## Status Color Coding
- **PR Sent**: Blue
- **Ordered**: Purple
- **Delivered**: Green
- **Out of Stock**: Red
- **Pending**: Yellow

## Tips & Best Practices

1. **Consistent Serial Numbers**: Use a consistent naming format (PS-001, PS-002, etc.)
2. **Add Comments**: Use the comments field to track delivery dates, suppliers, or issues
3. **Link Products**: Always add product links for future reference
4. **Regular Updates**: Keep statuses updated for accurate tracking
5. **Use Subsystems**: Organize products by subsystem for better categorization
6. **Export Data**: Use CSV export for reporting and backup

## Troubleshooting

### Products not showing up?
- Check that you're on the correct trip
- Ensure products have been successfully saved (no error messages)
- Refresh the page to sync with Firebase

### Status not updating?
- Ensure your internet connection is active
- Wait a moment for Firebase to sync changes
- Check browser console for error messages

### Can't delete a product?
- Confirm the deletion in the popup
- Check that you have proper permissions
- Try refreshing and attempting again

## Future Enhancements
- Batch import/export of products
- Product search and filtering
- Advanced analytics and charts
- Photo attachments for products
- Supplier tracking
- Budget analysis
