# PS Feature Testing Guide

## Manual Testing Checklist

### 1. Basic Product Addition ✅

**Test Case 1.1: Add Product with All Fields**
- [ ] Navigate to Products (PS) tab
- [ ] Click "Add Product"
- [ ] Fill all fields:
  - Serial Number: PS-001
  - Item Name: Test Item
  - Quantity: 5
  - Added By: Select a person
  - Status: PR Sent
  - Subsystem: Mech
  - Price Per Unit: 100
  - Total Price: 500
  - Product Link: https://example.com
  - Comments: Test comment
- [ ] Click "Add Product"
- [ ] Verify product appears in table

**Test Case 1.2: Add Product with Minimal Fields**
- [ ] Fill only required fields (Serial Number, Item Name, Added By)
- [ ] Click "Add Product"
- [ ] Verify product appears in table

**Test Case 1.3: Form Validation**
- [ ] Leave Serial Number empty and try to submit
- [ ] Verify error message appears
- [ ] Leave Item Name empty and try to submit
- [ ] Verify error message appears
- [ ] Leave Added By empty and try to submit
- [ ] Verify error message appears

### 2. Product Display ✅

**Test Case 2.1: Table Display**
- [ ] Verify all columns are visible
- [ ] Verify product data displays correctly
- [ ] Verify creation date shows
- [ ] Verify Added By avatar displays
- [ ] Verify status badge shows with color

**Test Case 2.2: Product Notes Section**
- [ ] Add product with comments
- [ ] Scroll down to "Product Notes" section
- [ ] Verify notes appear below table
- [ ] Verify product serial and name display with note

**Test Case 2.3: Empty State**
- [ ] Delete all products from a trip
- [ ] Navigate to Products tab
- [ ] Verify empty state message displays
- [ ] Verify "Add Product" button works

### 3. Status Management ✅

**Test Case 3.1: Inline Status Editing**
- [ ] Click on any Status field
- [ ] Verify edit dropdown appears
- [ ] Verify all 5 status options show:
  - PR Sent
  - Ordered
  - Delivered
  - Out of Stock
  - Pending
- [ ] Select new status
- [ ] Click ✓ button
- [ ] Verify status updates in table
- [ ] Verify Firebase updates (refresh page)

**Test Case 3.2: Status Color Coding**
- [ ] Create products with each status
- [ ] Verify colors:
  - PR Sent: Blue
  - Ordered: Purple
  - Delivered: Green
  - Out of Stock: Red
  - Pending: Yellow

**Test Case 3.3: Cancel Status Edit**
- [ ] Click on Status
- [ ] Don't change anything
- [ ] Click ✕ button
- [ ] Verify status unchanged

### 4. Person Tracking with Avatars ✅

**Test Case 4.1: Avatar Display**
- [ ] Add products with different "Added By" values
- [ ] Verify each person's avatar displays correctly
- [ ] Verify avatar matches trip configuration

**Test Case 4.2: Person Dropdown**
- [ ] Click "Added By" dropdown in ProductForm
- [ ] Verify all trip participants appear
- [ ] Select each person
- [ ] Verify avatar preview shows (if avatar set)

### 5. Product Links ✅

**Test Case 5.1: Link Button**
- [ ] Add product with valid URL
- [ ] Click "Link" button in table
- [ ] Verify URL opens in new tab
- [ ] Verify no error occurs

**Test Case 5.2: No Link**
- [ ] Add product without link
- [ ] Verify "Link" button doesn't appear
- [ ] Or verify it's disabled

### 6. Tab Navigation ✅

**Test Case 6.1: Tab Switching**
- [ ] Click "💰 Expenses" tab
- [ ] Verify expenses view shows
- [ ] Click "📦 Products (PS)" tab
- [ ] Verify products view shows

**Test Case 6.2: Floating Action Button**
- [ ] On Expenses tab, click FAB
- [ ] Verify ExpenseForm opens
- [ ] Close form
- [ ] Switch to Products tab
- [ ] Click FAB
- [ ] Verify ProductForm opens

### 7. Real-Time Sync ✅

**Test Case 7.1: Firebase Sync**
- [ ] Add product in one browser tab
- [ ] Open app in another tab (same trip)
- [ ] Verify product appears automatically
- [ ] No page refresh needed

**Test Case 7.2: Status Update Sync**
- [ ] Update product status
- [ ] Check another browser tab
- [ ] Verify status updates instantly

### 8. Product Deletion ✅

**Test Case 8.1: Delete Product**
- [ ] Click "Delete" button on any product
- [ ] Verify confirmation dialog
- [ ] Click "OK" to confirm
- [ ] Verify product removed from table

**Test Case 8.2: Cancel Delete**
- [ ] Click "Delete" button
- [ ] Verify confirmation dialog
- [ ] Click "Cancel"
- [ ] Verify product still in table

### 9. Data Persistence ✅

**Test Case 9.1: Page Refresh**
- [ ] Add product
- [ ] Refresh page
- [ ] Verify product still appears

**Test Case 9.2: Trip Switching**
- [ ] Add products to Trip A
- [ ] Switch to Trip B
- [ ] Verify Trip A products don't appear
- [ ] Switch back to Trip A
- [ ] Verify products reappear

### 10. PS API Functions ✅

**Test Case 10.1: getAllProductsInTrip()**
```typescript
import { getAllProductsInTrip } from './services/ps-api';
const products = await getAllProductsInTrip(tripId);
console.log(`Found ${products.length} products`);
// Verify console shows correct count
```

**Test Case 10.2: getProductBySerialNumber()**
```typescript
import { getProductBySerialNumber } from './services/ps-api';
const product = await getProductBySerialNumber(tripId, 'PS-001');
console.log(product?.itemName);
// Verify correct product found
```

**Test Case 10.3: getProductsByStatus()**
```typescript
import { getProductsByStatus } from './services/ps-api';
const delivered = await getProductsByStatus(tripId, 'Delivered');
console.log(`${delivered.length} delivered items`);
// Verify correct count
```

**Test Case 10.4: getProductsByPerson()**
```typescript
import { getProductsByPerson } from './services/ps-api';
const items = await getProductsByPerson(tripId, 'Yash');
console.log(`${items.length} items added by Yash`);
// Verify correct count
```

**Test Case 10.5: getProductStats()**
```typescript
import { getProductStats } from './services/ps-api';
const stats = await getProductStats(tripId);
console.log(`Total value: ₹${stats.totalValue}`);
console.log(`By status:`, stats.byStatus);
console.log(`By person:`, stats.byPerson);
// Verify stats are correct
```

**Test Case 10.6: exportProductsAsCSV()**
```typescript
import { exportProductsAsCSV } from './services/ps-api';
const csv = await exportProductsAsCSV(tripId);
console.log(csv);
// Verify CSV format with headers and data
```

**Test Case 10.7: generateProductReport()**
```typescript
import { generateProductReport } from './services/ps-api';
const report = await generateProductReport(tripId);
console.log(report);
// Verify formatted report displays
```

### 11. UI/UX Testing ✅

**Test Case 11.1: Responsiveness**
- [ ] Test on mobile (phone)
- [ ] Verify form is readable
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Verify all elements visible and functional

**Test Case 11.2: Loading States**
- [ ] Add slow network in DevTools
- [ ] Add product
- [ ] Verify "Adding..." state shows
- [ ] Verify button disabled during loading

**Test Case 11.3: Error Handling**
- [ ] Go offline
- [ ] Try to add product
- [ ] Verify error message shows
- [ ] Go back online
- [ ] Try again
- [ ] Verify product saves

### 12. Edge Cases ✅

**Test Case 12.1: Special Characters**
- [ ] Add product with special characters in name (™®©)
- [ ] Verify displays correctly

**Test Case 12.2: Long Text**
- [ ] Add very long item name
- [ ] Add very long comment
- [ ] Verify displays without breaking layout

**Test Case 12.3: Maximum Quantity**
- [ ] Enter very large quantity (999999)
- [ ] Verify saves correctly

**Test Case 12.4: Zero Values**
- [ ] Try quantity = 0
- [ ] Try price = 0
- [ ] Verify saves correctly

### 13. Sorting & Filtering ✅

**Test Case 13.1: Serial Number Sorting**
- [ ] Add products: PS-005, PS-002, PS-010, PS-001
- [ ] Verify displayed in order: PS-001, PS-002, PS-005, PS-010

**Test Case 13.2: Date Sorting**
- [ ] Verify products sorted by creation date (newest first in Firebase)

## Browser Compatibility ✅

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Performance Testing ✅

**Test Case: Large Dataset**
- [ ] Add 100+ products
- [ ] Verify table still responsive
- [ ] Verify no lag when updating status
- [ ] Verify search/filter still fast

## Security Testing ✅

**Test Case 1: Trip Isolation**
- [ ] Add product to Trip A
- [ ] As different user, access Trip B
- [ ] Verify Trip A products not visible

**Test Case 2: Data Validation**
- [ ] Try injection attacks in fields
- [ ] Verify properly escaped
- [ ] Verify no console errors

## Accessibility Testing ✅

- [ ] Tab through form fields
- [ ] Verify keyboard navigation works
- [ ] Test with screen reader
- [ ] Verify proper labels on inputs
- [ ] Verify color contrast adequate

## Sign-Off Checklist

- [ ] All test cases passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Firebase sync verified
- [ ] UI looks good on all devices
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

---

**Tester Name**: _______________  
**Date**: _______________  
**Notes**: 
