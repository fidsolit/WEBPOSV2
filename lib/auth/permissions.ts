// Role-based access control

export type UserRole = 'admin' | 'manager' | 'cashier'

export interface Permission {
  canAccessDashboard: boolean
  canAccessPOS: boolean
  canViewProducts: boolean
  canManageProducts: boolean
  canViewCategories: boolean
  canManageCategories: boolean
  canViewSales: boolean
  canManageSales: boolean
  canViewReports: boolean
  canManageUsers: boolean
  canAccessSettings: boolean
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canAccessDashboard: true,
    canAccessPOS: true,
    canViewProducts: true,
    canManageProducts: true,
    canViewCategories: true,
    canManageCategories: true,
    canViewSales: true,
    canManageSales: true,
    canViewReports: true,
    canManageUsers: true,
    canAccessSettings: true,
  },
  manager: {
    canAccessDashboard: true,
    canAccessPOS: true,
    canViewProducts: true,
    canManageProducts: true,
    canViewCategories: true,
    canManageCategories: true,
    canViewSales: true,
    canManageSales: false,
    canViewReports: true,
    canManageUsers: false,
    canAccessSettings: false,
  },
  cashier: {
    canAccessDashboard: true,
    canAccessPOS: true,
    canViewProducts: true,
    canManageProducts: false,
    canViewCategories: false,
    canManageCategories: false,
    canViewSales: true,
    canManageSales: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessSettings: false,
  },
}

export function getPermissions(role: UserRole | string | null): Permission {
  if (!role || !rolePermissions[role as UserRole]) {
    return rolePermissions.cashier // Default to cashier permissions
  }
  return rolePermissions[role as UserRole]
}

export function hasPermission(
  role: UserRole | string | null,
  permission: keyof Permission
): boolean {
  const permissions = getPermissions(role)
  return permissions[permission]
}

export function canAccessRoute(
  role: UserRole | string | null,
  route: string
): boolean {
  const permissions = getPermissions(role)

  // Define route access rules
  if (route.startsWith('/dashboard')) {
    return permissions.canAccessDashboard
  }
  if (route.startsWith('/pos')) {
    return permissions.canAccessPOS
  }
  if (route.startsWith('/products')) {
    return permissions.canViewProducts
  }
  if (route.startsWith('/categories')) {
    return permissions.canViewCategories
  }
  if (route.startsWith('/sales')) {
    return permissions.canViewSales
  }
  if (route.startsWith('/users')) {
    return permissions.canManageUsers
  }
  if (route.startsWith('/settings')) {
    return permissions.canAccessSettings
  }

  return true // Allow access to unspecified routes
}

export function getRoleLabel(role: UserRole | string | null): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'manager':
      return 'Manager'
    case 'cashier':
      return 'Cashier'
    default:
      return 'User'
  }
}

export function getRoleBadgeColor(role: UserRole | string | null): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700'
    case 'manager':
      return 'bg-blue-100 text-blue-700'
    case 'cashier':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

