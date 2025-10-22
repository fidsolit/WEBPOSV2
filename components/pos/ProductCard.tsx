import React, { memo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { ProductWithCategory } from '@/types'

interface ProductCardProps {
  product: ProductWithCategory
  onAddToCart: (product: ProductWithCategory) => void
}

const ProductCard = memo<ProductCardProps>(({ product, onAddToCart }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onAddToCart(product)}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-5xl">🛍️</span>
        </div>
        <h3 className="font-semibold text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {product.sku}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            ₱{product.price.toFixed(2)}
          </span>
          <span
            className={`text-xs font-medium ${
              product.stock < 10 ? "text-red-600" : "text-gray-500"
            }`}
          >
            {product.stock} left
          </span>
        </div>
      </CardContent>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
