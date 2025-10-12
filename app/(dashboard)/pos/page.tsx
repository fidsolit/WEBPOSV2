'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/useCartStore'
import { Product, ProductWithCategory } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Plus, Minus, Trash2, CreditCard, Scan, Grid3x3, List } from 'lucide-react'
import toast from 'react-hot-toast'
import CheckoutModal from '@/components/pos/CheckoutModal'

export default function POSPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const barcodeTimeoutRef = useRef<NodeJS.Timeout>()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { items, addItem, updateQuantity, removeItem, getTotal, getSubtotal, getTax, clearCart } = useCartStore()
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
    // Load saved view mode from localStorage
    const savedViewMode = localStorage.getItem('posViewMode') as 'grid' | 'table'
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Barcode scanner listener
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in search input or any other input field
      if (
        e.target === searchInputRef.current ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Clear previous timeout
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current)
      }

      // Handle Enter key (barcode scanner sends Enter after scanning)
      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 8) {
          setIsScanning(true)
          searchProductByBarcode(barcodeBuffer)
          setBarcodeBuffer('')
          // Clear scanning indicator after 1 second
          setTimeout(() => setIsScanning(false), 1000)
        }
        return
      }

      // Build barcode string (only accept numbers for barcode)
      if (e.key.length === 1 && /[0-9]/.test(e.key)) {
        setBarcodeBuffer(prev => prev + e.key)
        setIsScanning(true)

        // Auto-clear buffer after 100ms of no input
        barcodeTimeoutRef.current = setTimeout(() => {
          setBarcodeBuffer('')
          setIsScanning(false)
        }, 100)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current)
      }
    }
  }, [barcodeBuffer])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts((data as any) || [])
      setFilteredProducts((data as any) || [])
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.categories?.name === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const categories = ['All', ...Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean) as string[]))]

  // Toggle view mode
  const toggleViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode)
    localStorage.setItem('posViewMode', mode)
  }

  // Search product by barcode
  const searchProductByBarcode = async (barcode: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error(`Product not found: ${barcode}`, {
          icon: '❌',
          duration: 2000,
        })
        return
      }

      // Check stock
      if (data.stock <= 0) {
        toast.error(`${data.name} is out of stock!`, {
          icon: '⚠️',
        })
        return
      }

      // Add to cart
      addItem(data)
      toast.success(`Added: ${data.name}`, {
        icon: '✅',
        duration: 2000,
      })

      // Play success sound (optional)
      const audio = new Audio('data:audio/wav;base64,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')
      audio.play().catch(() => {}) // Ignore if audio doesn't play
    } catch (error) {
      console.error('Barcode scan error:', error)
      toast.error('Failed to scan barcode')
    }
  }

  const handleCheckoutComplete = () => {
    clearCart()
    setIsCheckoutOpen(false)
    toast.success('Sale completed successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-gray-600 mt-2">Select products to add to cart or scan barcode</p>
          </div>
          {isScanning && (
            <div className="flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg animate-pulse">
              <Scan className="w-5 h-5" />
              <span className="font-semibold">Scanning: {barcodeBuffer}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search and Filter */}
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Scan className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Categories and View Toggle */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-white border border-gray-300 rounded-lg p-1 gap-1 shrink-0">
                <button
                  onClick={() => toggleViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => toggleViewMode('table')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Table View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'grid' ? (
              // Grid View with Pictures
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => addItem(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-5xl">🛍️</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary-600">
                            ₱{product.price.toFixed(2)}
                          </span>
                          <span className={`text-xs font-medium ${
                            product.stock < 10 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {product.stock} left
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </>
            ) : (
              // Table View without Pictures
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => addItem(product)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {product.categories?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-primary-600">
                            ₱{product.price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-semibold ${
                            product.stock < 10 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              addItem(product)
                            }}
                            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cart</h2>
              <p className="text-sm text-gray-600">{items.length} items</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">₱{item.product.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
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
                ))
              )}
            </div>

            {/* Cart Summary */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₱{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (10%):</span>
                <span className="font-semibold">₱{getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total:</span>
                <span>₱{getTotal().toFixed(2)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={CreditCard}
                className="w-full"
                disabled={items.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Checkout
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onComplete={handleCheckoutComplete}
      />
    </div>
  )
}

