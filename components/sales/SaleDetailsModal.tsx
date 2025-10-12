'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Sale, SaleItem } from '@/types'
import { format } from 'date-fns'
import { Printer, Download } from 'lucide-react'

interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface SaleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  sale: SaleWithItems | null
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
  if (!sale) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sale Details" size="lg">
      <div className="space-y-6">
        {/* Sale Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sale Number</p>
              <p className="font-mono font-semibold text-gray-900">{sale.sale_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(sale.created_at), 'MMM d, yyyy HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900">
                {sale.customer_name || 'Walk-in Customer'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-900 capitalize">
                {sale.payment_method.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cashier</p>
              <p className="font-semibold text-gray-900">
                {sale.profiles?.full_name || sale.profiles?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                sale.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : sale.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {sale.status}
              </span>
            </div>
          </div>
        </div>

        {/* Sale Items */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.sale_items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">
                      ₱{Number(item.unit_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      ₱{Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sale Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900">₱{Number(sale.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-semibold text-gray-900">₱{Number(sale.tax).toFixed(2)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">-₱{Number(sale.discount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-primary-600">₱{Number(sale.total).toFixed(2)}</span>
          </div>
        </div>

        {sale.notes && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{sale.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            icon={Printer}
            className="flex-1"
            onClick={handlePrint}
          >
            Print Receipt
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

