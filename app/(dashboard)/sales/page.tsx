'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sale, SaleItem } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Search, Eye, Printer, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import SaleDetailsModal from '@/components/sales/SaleDetailsModal'

interface SaleWithItems extends Sale {
  sale_items: SaleItem[]
  profiles?: {
    full_name: string | null
    email: string
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState<SaleWithItems[]>([])
  const [filteredSales, setFilteredSales] = useState<SaleWithItems[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  const supabase = createClient()

  useEffect(() => {
    loadSales()
  }, [currentPage, dateFilter])

  useEffect(() => {
    filterSales()
  }, [searchQuery, sales])

  const loadSales = async () => {
    setLoading(true)
    try {
      // Calculate range for pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      // Build query with date filter
      let query = supabase
        .from('sales')
        .select(`
          *,
          sale_items (*),
          profiles (full_name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        if (dateFilter === 'today') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (dateFilter === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (dateFilter === 'month') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      const { data, error, count } = await query.range(from, to)

      if (error) throw error
      setSales(data || [])
      setFilteredSales(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading sales:', error)
      toast.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }

  const filterSales = () => {
    let filtered = sales

    // Search filter (date filter already applied in loadSales)
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.sale_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredSales(filtered)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDateFilterChange = (filter: typeof dateFilter) => {
    setDateFilter(filter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const handleViewDetails = (sale: SaleWithItems) => {
    setSelectedSale(sale)
    setIsModalOpen(true)
  }

  const getTotalSales = () => {
    return filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0)
  }

  const getAverageSale = () => {
    if (filteredSales.length === 0) return 0
    return getTotalSales() / filteredSales.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-2">View and manage all transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₱{getTotalSales().toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{filteredSales.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Average Sale</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ₱{getAverageSale().toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {filteredSales.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">In selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by sale number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => handleDateFilterChange(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  dateFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sale #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {sale.sale_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {format(new Date(sale.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.customer_name || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {sale.sale_items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₱{Number(sale.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                        {sale.payment_method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        sale.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : sale.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No sales found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(currentPage * itemsPerPage, totalCount)}
            </span>{' '}
            of <span className="font-semibold">{totalCount}</span> sales
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={ChevronLeft}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      <SaleDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sale={selectedSale}
      />
    </div>
  )
}

