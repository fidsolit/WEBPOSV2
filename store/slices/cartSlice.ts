import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const product = action.payload
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ product, quantity: 1 })
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload
      
      if (quantity <= 0) {
        state.items = state.items.filter((item) => item.product.id !== productId)
      } else {
        const item = state.items.find((item) => item.product.id === productId)
        if (item) {
          item.quantity = quantity
        }
      }
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer

