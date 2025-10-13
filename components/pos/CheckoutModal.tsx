'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppSelector } from '@/store/hooks'
import { selectCartItems, selectCartSubtotal, selectCartTax, selectCartTotal } from '@/store/selectors'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { PaymentMethod } from '@/types'
import { CreditCard, Wallet, Banknote } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function CheckoutModal({ isOpen, onClose, onComplete }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartSubtotal)
  const tax = useAppSelector(selectCartTax)
  const total = useAppSelector(selectCartTotal)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current session and user
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      
      if (!user || !session) {
        toast.error('You must be logged in. Please login again.')
        console.error('No user session found')
        setLoading(false)
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
        return
      }

      console.log('User found:', user.email)

      // Ensure profile exists (create if missing)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        console.error('Profile not found for user:', user.id)
        toast.error('User profile not found. Please logout and login again.')
        setLoading(false)
        return
      }

      // Check if profile is active
      if (!existingProfile.is_active) {
        toast.error('Your account is pending admin approval. Please contact an administrator.')
        setLoading(false)
        return
      }

      console.log('Profile verified, proceeding with sale...')

      // Generate sale number
      const { data: saleNumberData } = await supabase.rpc('generate_sale_number')
      const saleNumber = saleNumberData || `SALE-${Date.now()}`

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          sale_number: saleNumber,
          user_id: user.id,
          customer_name: customerName || null,
          subtotal: subtotal,
          tax: tax,
          discount: 0,
          total: total,
          payment_method: paymentMethod,
          status: 'completed',
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id)

        if (stockError) throw stockError
      }

      toast.success('Sale completed successfully!')
      onComplete()
      
      // Reset form
      setCustomerName('')
      setPaymentMethod('cash')
    } catch (error: any) {
      console.error('Error completing sale:', error)
      toast.error(error.message || 'Failed to complete sale')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { value: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
    { value: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
    { value: 'digital_wallet' as PaymentMethod, label: 'Digital Wallet', icon: Wallet },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          {items.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product.name} x {item.quantity}
              </span>
              <span className="font-semibold">
                ₱{(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-primary-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Name */}
        <Input
          label="Customer Name (Optional)"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
        />

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${
                  paymentMethod === value ? 'text-primary-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  paymentMethod === value ? 'text-primary-600' : 'text-gray-700'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

