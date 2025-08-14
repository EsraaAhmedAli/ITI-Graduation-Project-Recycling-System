# Voice Cart Issue Fix

## Problem
The voice processing feature had inconsistent cart merging behavior:
- **Guest users**: Items were properly merged with existing cart items
- **Logged-in users**: Items were overriding the current cart instead of merging

## Root Cause
The `getFreshCartState()` function in `ItemsDisplayCard.tsx` was always reading from localStorage (`guest_cart`) regardless of user authentication status. For logged-in users, the cart should be retrieved from the context (which loads from the database).

## Solution
1. **Import authentication context**: Added `useUserAuth` import to access user authentication status
2. **Fix getFreshCartState()**: Updated the function to:
   - Use cart from context for logged-in users (loads from database)
   - Use localStorage for guest users
3. **Add proper dependencies**: Wrapped `addAllToCart` in `useCallback` with correct dependencies

## Code Changes
- Added authentication context import
- Modified `getFreshCartState()` to check `isLoggedIn` status
- Added proper React dependencies for the callback functions
- Enhanced logging to show different behavior for logged-in vs guest users

## Testing
To test the fix:
1. **As Guest**: Add items via voice → should merge with existing cart
2. **As Logged User**: Add items via voice → should merge with existing cart (not override)
3. **Switch between guest/logged**: Cart behavior should be consistent

The fix ensures that voice-processed items are always merged with the existing cart, regardless of user authentication status.
