'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  LogOut,
  Menu,
  X,
  FolderOpen,
  Users,
  Shield,
  Archive
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth/permissions'

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    requiredPermission: 'canAccessDashboard' as const,
  },
  {
    name: 'Point of Sale',
    icon: ShoppingCart,
    href: '/pos',
    requiredPermission: 'canAccessPOS' as const,
  },
  {
    name: 'Products',
    icon: Package,
    href: '/products',
    requiredPermission: 'canViewProducts' as const,
  },
  {
    name: 'Categories',
    icon: FolderOpen,
    href: '/categories',
    requiredPermission: 'canViewCategories' as const,
  },
  {
    name: 'Sales History',
    icon: Receipt,
    href: '/sales',
    requiredPermission: 'canViewSales' as const,
  },
  {
    name: 'Inventory',
    icon: Archive,
    href: '/inventory',
    requiredPermission: 'canManageUsers' as const,
  },
  {
    name: 'Users',
    icon: Users,
    href: '/users',
    requiredPermission: 'canManageUsers' as const,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { profile, permissions } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(
    (item) => permissions[item.requiredPermission]
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & User Info */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-center h-20">
              <ShoppingCart className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Web POS</span>
            </div>
            
            {/* User Role Badge */}
            {profile && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600">Logged in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {profile.full_name || profile.email}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(profile.role)}`}>
                    {getRoleLabel(profile.role)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  )
}

