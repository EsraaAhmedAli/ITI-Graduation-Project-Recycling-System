# Inventory Checking System

## Overview

This system implements real-time inventory checking for the recycling platform's cart functionality. It ensures that items can only be added to the cart if they are available in stock.

## Features

### ✅ **المخزون موجود** → إضافة بنجاح
- When inventory is available, items are successfully added to cart
- Success toast notification is shown
- Button remains enabled for further actions

### ❌ **المخزون غير موجود** → لا إضافة + toast خطأ + زر معطل
- When inventory is insufficient, items are NOT added to cart
- Error toast notification is shown in Arabic
- Button is disabled to prevent further attempts

## Implementation Details

### CartContext Enhancements

The `CartContext` has been enhanced with the following new functions:

#### `checkInventory(itemId: string, quantity: number): Promise<boolean>`
- Checks if the requested quantity is available for a specific item
- Returns `true` if inventory is sufficient, `false` otherwise
- Makes API call to `/categories/get-items` to get current stock levels

#### `isItemInStock(item: ICartItem): boolean`
- Utility function to check if an item has available quantity
- Uses the `availableQty` property from the cart item

### Enhanced Functions

#### `addToCart(item: ICartItem)`
- Now includes inventory checking before adding to cart
- Shows Arabic error message if inventory is insufficient
- Only proceeds with cart addition if inventory is available

#### `increaseQty(item: ICartItem)`
- Checks inventory before increasing quantity
- Prevents quantity increase if insufficient stock
- Shows error message in Arabic

### UI Components

#### `InventoryStatus` Component
- Reusable component for displaying inventory status
- Shows real-time stock availability
- Includes loading states and error handling
- Can be used with custom buttons or children

#### `InventoryTest` Component
- Test component to demonstrate inventory checking functionality
- Allows testing with different quantities
- Shows real-time results of inventory checks

## Usage Examples

### Basic Inventory Check
```typescript
const { checkInventory } = useCart();

const isAvailable = await checkInventory(itemId, requestedQuantity);
if (isAvailable) {
  // Proceed with adding to cart
} else {
  // Show error message
}
```

### Using InventoryStatus Component
```typescript
import InventoryStatus from '@/components/common/InventoryStatus';

<InventoryStatus 
  item={cartItem}
  requestedQuantity={2}
  showButton={true}
  onAddToCart={handleAddToCart}
/>
```

### Custom Implementation
```typescript
const { addToCart, loadingItemId } = useCart();

<button
  onClick={handleAddToCart}
  disabled={loadingItemId === item._id}
  className={loadingItemId === item._id ? 'disabled' : 'enabled'}
>
  {loadingItemId === item._id ? 'جاري الإضافة...' : 'إضافة إلى السلة'}
</button>
```

## API Integration

The system integrates with the existing API endpoints:

- **GET** `/categories/get-items` - Fetches current inventory levels
- **POST** `/cart` - Adds items to cart (with inventory validation)
- **PUT** `/cart` - Updates cart quantities (with inventory validation)

## Error Handling

### Arabic Error Messages
- "عذراً، الكمية المطلوبة غير متوفرة في المخزون" - When inventory is insufficient
- "تم إضافة المنتج إلى السلة بنجاح" - When item is successfully added
- "فشل في إضافة المنتج إلى السلة" - When API call fails

### Loading States
- Buttons show loading spinners during inventory checks
- Disabled states prevent multiple simultaneous requests
- Visual feedback for user actions

## Testing

Use the `InventoryTest` component to test the functionality:

1. Set different quantities
2. Click "فحص المخزون" to check availability
3. Try adding to cart with different scenarios
4. Observe error messages and button states

## Future Enhancements

- Real-time inventory updates using WebSocket
- Inventory reservation system
- Low stock warnings
- Bulk inventory checking for multiple items
- Inventory history tracking 