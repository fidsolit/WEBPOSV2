import { createSelector } from '@reduxjs/toolkit'
import { RootState } from './index'

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user
export const selectProfile = (state: RootState) => state.auth.profile
export const selectToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated

// Cart selectors
export const selectCartItems = (state: RootState) => state.cart.items

// Memoized cart calculations to prevent unnecessary recalculations
export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.product.price * item.quantity, 0)
)

export const selectCartTax = createSelector(
  [selectCartSubtotal],
  (subtotal) => subtotal * 0.1 // 10% tax
)

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectCartTax],
  (subtotal, tax) => subtotal + tax
)

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
)

