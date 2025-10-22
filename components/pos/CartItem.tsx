import React, { memo } from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onRemoveItem: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
}

const CartItem = memo<CartItemProps>(({ item, onRemoveItem, onUpdateQuantity }) => {
  const handleQuantityChange = (newQuantity: number) => {
    onUpdateQuantity(item.product.id, newQuantity)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
          <p className="text-sm text-gray-600">₱{item.product.price.toFixed(2)}</p>
        </div>
        <button
          onClick={() => onRemoveItem(item.product.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-8 h-8 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            disabled={item.quantity >= item.product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="font-bold text-gray-900">
          ₱{(item.product.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  )
})

CartItem.displayName = 'CartItem'

export default CartItem
