import { Database } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type InventoryAdjustment = Database['public']['Tables']['inventory_adjustments']['Row']

export interface ProductWithCategory extends Product {
  categories?: Category | null
}

export interface InventoryAdjustmentWithDetails extends InventoryAdjustment {
  products?: {
    name: string
    sku: string
  }
  profiles?: {
    full_name: string | null
    email: string
  }
}

export type AdjustmentType = 'restock' | 'loss' | 'damage' | 'return' | 'correction' | 'expired'

export interface CartItem {
  product: Product
  quantity: number
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
}

export type PaymentMethod = 'cash' | 'card' | 'digital_wallet'
export type SaleStatus = 'completed' | 'cancelled' | 'refunded'

