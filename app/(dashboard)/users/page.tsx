'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, UserPlus, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth/permissions'
import { Modal } from '@/components/ui/Modal'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function UsersPage() {
  return (
    <ProtectedRoute requiredPermission="canManageUsers">
      <UsersContent />
    </ProtectedRoute>
  )
}

function UsersContent() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newRole, setNewRole] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.is_active
    if (filter === 'active') return user.is_active
    if (filter === 'inactive') return !user.is_active
    return true // 'all'
  })

  const pendingCount = users.filter(u => !u.is_active).length

  const handleChangeRole = (user: Profile) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setIsModalOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)

      if (error) throw error

      toast.success('User role updated successfully')
      setIsModalOpen(false)
      loadUsers()
    } catch (error: any) {
      console.error('Error updating role:', error)
      toast.error(error.message || 'Failed to update user role')
    }
  }

  const handleToggleStatus = async (user: Profile) => {
    const action = user.is_active ? 'deactivate' : 'approve'
    const confirmMessage = user.is_active 
      ? `Are you sure you want to deactivate ${user.email}?`
      : `Approve ${user.email} to access the system?`

    if (!confirm(confirmMessage)) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)

      if (error) throw error

      toast.success(`User ${user.is_active ? 'deactivated' : 'approved'} successfully`)
      loadUsers()
    } catch (error: any) {
      console.error('Error toggling status:', error)
      toast.error(error.message || 'Failed to update user status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Approve new users and manage permissions</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
              <span className="text-orange-700 font-semibold">
                {pendingCount} user{pendingCount !== 1 ? 's' : ''} pending approval
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {(['all', 'pending', 'active', 'inactive'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {filterOption}
              {filterOption === 'pending' && pendingCount > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'bg-orange-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <Shield className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.full_name || 'No Name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Pending Approval'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleChangeRole(user)}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Change Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg font-medium ${
                          user.is_active 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : '✓ Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {filter === 'pending' ? 'No pending users' : 'No users found'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Change User Role"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">User</p>
              <p className="font-semibold text-gray-900">
                {selectedUser.full_name || selectedUser.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="cashier">Cashier - Basic POS access</option>
                <option value="manager">Manager - Full access except user management</option>
                <option value="admin">Administrator - Full system access</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Role Permissions:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                {newRole === 'admin' && (
                  <>
                    <li>✅ Full access to all features</li>
                    <li>✅ Manage users and roles</li>
                    <li>✅ View all reports</li>
                  </>
                )}
                {newRole === 'manager' && (
                  <>
                    <li>✅ Manage products and categories</li>
                    <li>✅ View sales and reports</li>
                    <li>❌ Cannot manage users</li>
                  </>
                )}
                {newRole === 'cashier' && (
                  <>
                    <li>✅ Process sales at POS</li>
                    <li>✅ View products</li>
                    <li>❌ Cannot edit products</li>
                    <li>❌ Cannot manage users</li>
                  </>
                )}
              </ul>
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
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleUpdateRole}
              >
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

