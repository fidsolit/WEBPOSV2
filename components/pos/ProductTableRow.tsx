import React, { memo } from 'react'
import { ProductWithCategory } from '@/types'

interface ProductTableRowProps {
  product: ProductWithCategory
  onAddToCart: (product: ProductWithCategory) => void
}

const ProductTableRow = memo<ProductTableRowProps>(({ product, onAddToCart }) => {
  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onAddToCart(product)}
    >
      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">{product.sku}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
          {product.categories?.name || "N/A"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="font-bold text-primary-600">
          ₱{product.price.toFixed(2)}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`font-semibold ${
            product.stock < 10 ? "text-red-600" : "text-gray-700"
          }`}
        >
          {product.stock}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
        >
          Add
        </button>
      </td>
    </tr>
  )
})

ProductTableRow.displayName = 'ProductTableRow'

export default ProductTableRow
