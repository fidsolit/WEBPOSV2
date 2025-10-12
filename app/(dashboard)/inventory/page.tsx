'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InventoryAdjustmentWithDetails, ProductWithCategory } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, TrendingDown, AlertTriangle, Package, FileText, Scan, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredPermission="canManageUsers">
      <InventoryContent />
    </ProtectedRoute>
  )
}

function InventoryContent() {
  const [adjustments, setAdjustments] = useState<InventoryAdjustmentWithDetails[]>([])
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'loss' | 'damage' | 'expired'>('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  
  const [formData, setFormData] = useState({
    product_id: '',
    adjustment_type: 'loss',
    quantity: '',
    reason: '',
    notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load adjustments with product and user info
      const { data: adjustmentsData, error: adjError } = await supabase
        .from('inventory_adjustments')
        .select(`
          *,
          products (name, sku),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (adjError) throw adjError
      setAdjustments(adjustmentsData || [])

      // Load products with categories
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('is_active', true)
        .order('name')

      if (prodError) throw prodError
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error loading inventory data:', error)
      toast.error('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const searchProductByBarcode = async (barcode: string) => {
    setIsScanning(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('barcode', barcode)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        toast.error(`Product not found: ${barcode}`)
        setBarcodeInput('')
        return
      }

      // Set product in form
      setFormData({ ...formData, product_id: data.id })
      toast.success(`Selected: ${data.name}`)
      setBarcodeInput('')
    } catch (error) {
      console.error('Barcode scan error:', error)
      toast.error('Failed to scan barcode')
      setBarcodeInput('')
    } finally {
      setTimeout(() => setIsScanning(false), 500)
    }
  }

  const handleBarcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcodeInput(e.target.value)
  }

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.length >= 8) {
      searchProductByBarcode(barcodeInput)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Get current product stock
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', formData.product_id)
        .single()

      if (!product) {
        toast.error('Product not found')
        return
      }

      const quantity = parseInt(formData.quantity)
      const previousStock = product.stock
      let newStock = previousStock

      // Calculate new stock based on adjustment type
      if (['loss', 'damage', 'expired'].includes(formData.adjustment_type)) {
        newStock = previousStock - quantity
      } else if (formData.adjustment_type === 'restock') {
        newStock = previousStock + quantity
      } else if (formData.adjustment_type === 'return') {
        newStock = previousStock + quantity
      } else if (formData.adjustment_type === 'correction') {
        newStock = quantity // Direct set for corrections
      }

      if (newStock < 0) {
        toast.error('Stock cannot be negative')
        return
      }

      // Create adjustment record
      const { error: adjError } = await supabase
        .from('inventory_adjustments')
        .insert({
          product_id: formData.product_id,
          user_id: user.id,
          adjustment_type: formData.adjustment_type,
          quantity: formData.adjustment_type === 'correction' ? quantity - previousStock : quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: formData.reason || null,
          notes: formData.notes || null,
        })

      if (adjError) throw adjError

      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', formData.product_id)

      if (stockError) throw stockError

      toast.success('Inventory adjustment recorded')
      setIsModalOpen(false)
      setBarcodeInput('')
      setFormData({
        product_id: '',
        adjustment_type: 'loss',
        quantity: '',
        reason: '',
        notes: '',
      })
      loadData()
    } catch (error: any) {
      console.error('Error recording adjustment:', error)
      toast.error(error.message || 'Failed to record adjustment')
    }
  }

  const getStats = () => {
    const totalLoss = adjustments
      .filter(a => ['loss', 'damage', 'expired'].includes(a.adjustment_type))
      .reduce((sum, a) => sum + Math.abs(a.quantity), 0)

    const lossValue = adjustments
      .filter(a => ['loss', 'damage', 'expired'].includes(a.adjustment_type))
      .reduce((sum, a) => sum + Math.abs(a.quantity), 0) // Would need product price for actual value

    const totalAdjustments = adjustments.length

    return { totalLoss, lossValue, totalAdjustments }
  }

  const filteredAdjustments = adjustments.filter(adj => {
    if (filterType === 'all') return true
    return adj.adjustment_type === filterType
  })

  const stats = getStats()

  const adjustmentTypeLabels = {
    restock: { label: 'Restock', color: 'bg-green-100 text-green-700', icon: '📦' },
    loss: { label: 'Loss', color: 'bg-red-100 text-red-700', icon: '❌' },
    damage: { label: 'Damage', color: 'bg-orange-100 text-orange-700', icon: '⚠️' },
    return: { label: 'Return', color: 'bg-blue-100 text-blue-700', icon: '↩️' },
    correction: { label: 'Correction', color: 'bg-purple-100 text-purple-700', icon: '🔧' },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: '📅' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track stock adjustments, losses, and damages</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Record Adjustment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lost Items</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.totalLoss}</p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-red-500 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Adjustments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAdjustments}</p>
                <p className="text-sm text-gray-500 mt-1">All records</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products Tracked</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
                <p className="text-sm text-gray-500 mt-1">Active inventory</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'loss', 'damage', 'expired'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterType(filter)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filterType === filter
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {filter === 'all' ? 'All Adjustments' : filter}
          </button>
        ))}
      </div>

      {/* Adjustments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Previous
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    New Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    By User
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdjustments.map((adjustment) => {
                  const typeInfo = adjustmentTypeLabels[adjustment.adjustment_type as keyof typeof adjustmentTypeLabels]
                  return (
                    <tr key={adjustment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {format(new Date(adjustment.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {adjustment.products?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">{adjustment.products?.sku}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeInfo?.color}`}>
                          {typeInfo?.icon} {typeInfo?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${
                          adjustment.quantity < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {adjustment.quantity > 0 ? '+' : ''}{adjustment.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {adjustment.previous_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-semibold text-gray-900">{adjustment.new_stock}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {adjustment.reason || '—'}
                        {adjustment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{adjustment.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {adjustment.profiles?.full_name || adjustment.profiles?.email || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredAdjustments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No inventory adjustments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Record Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setBarcodeInput('')
          setFormData({
            product_id: '',
            adjustment_type: 'loss',
            quantity: '',
            reason: '',
            notes: '',
          })
        }}
        title="Record Inventory Adjustment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Barcode Scanner Input */}
          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Scan className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-primary-900">Quick Scan</h4>
              {isScanning && (
                <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full animate-pulse">
                  Scanning...
                </span>
              )}
            </div>
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeInputChange}
                  placeholder="Scan or type barcode here..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!barcodeInput}
              >
                Search
              </Button>
            </form>
            <p className="text-xs text-primary-700 mt-2">
              💡 Scan product barcode or type it manually and press Enter
            </p>
          </div>

          {/* Product Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product {formData.product_id && '✓'}
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">-- Or Select Product Manually --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stock: {product.stock} - {product.barcode || 'No barcode'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <select
              value={formData.adjustment_type}
              onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="loss">❌ Loss (Missing/Stolen)</option>
              <option value="damage">⚠️ Damage (Broken/Damaged)</option>
              <option value="expired">📅 Expired (Past expiry date)</option>
              <option value="restock">📦 Restock (Add inventory)</option>
              <option value="return">↩️ Return (Customer return)</option>
              <option value="correction">🔧 Correction (Fix count)</option>
            </select>
          </div>

          <Input
            label={formData.adjustment_type === 'correction' ? 'New Stock Count' : 'Quantity'}
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            placeholder={formData.adjustment_type === 'correction' ? 'Enter actual count' : 'Enter quantity'}
            min="0"
          />

          <Input
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., Damaged during delivery"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              Record Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

