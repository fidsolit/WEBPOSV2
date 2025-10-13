import { RootState } from './index'

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user
export const selectProfile = (state: RootState) => state.auth.profile
export const selectToken = (state: RootState) => state.auth.token
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated

// Cart selectors
export const selectCartItems = (state: RootState) => state.cart.items

export const selectCartSubtotal = (state: RootState) => {
  return state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )
}

export const selectCartTax = (state: RootState) => {
  const subtotal = selectCartSubtotal(state)
  return subtotal * 0.1 // 10% tax
}

export const selectCartTotal = (state: RootState) => {
  return selectCartSubtotal(state) + selectCartTax(state)
}

export const selectCartItemCount = (state: RootState) => {
  return state.cart.items.reduce((total, item) => total + item.quantity, 0)
}

