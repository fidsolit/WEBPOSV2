"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Coins,
  ShoppingBag,
  Package,
  TrendingUp,
  UserCheck,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingUsers: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayTransactions: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { permissions, user, loading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    } else if (permissions) {
      loadDashboardData();
    }
  }, [permissions, user, authLoading]);
  // useEffect(() => {
  //   loadDashboardData()
  // }, [])

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's sales
      const { data: salesData } = await supabase
        .from("sales")
        .select("total, id")
        .gte("created_at", today.toISOString())
        .eq("status", "completed");

      const todaySales =
        salesData?.reduce(
          (sum: number, sale: any) => sum + Number(sale.total),
          0,
        ) || 0;
      const todayTransactions = salesData?.length || 0;

      // Get products stats
      const { data: productsData } = await supabase
        .from("products")
        .select("stock")
        .eq("is_active", true);

      const totalProducts = productsData?.length || 0;
      const lowStockProducts =
        productsData?.filter((p: any) => p.stock < 10).length || 0;

      // Get pending users count (admin only)
      let pendingUsers = 0;
      if (permissions.canManageUsers) {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id")
          .eq("is_active", false);

        pendingUsers = usersData?.length || 0;
      }

      setStats({
        todaySales,
        todayTransactions,
        totalProducts,
        lowStockProducts,
        pendingUsers,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "Today's Sales",
        value: `₱${stats.todaySales.toFixed(2)}`,
        icon: Coins,
        color: "bg-green-500",
      },
      {
        title: "Transactions",
        value: stats.todayTransactions.toString(),
        icon: ShoppingBag,
        color: "bg-blue-500",
      },
      {
        title: "Total Products",
        value: stats.totalProducts.toString(),
        icon: Package,
        color: "bg-purple-500",
      },
      {
        title: "Low Stock Items",
        value: stats.lowStockProducts.toString(),
        icon: TrendingUp,
        color: "bg-orange-500",
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Pending Users Alert (Admin Only) */}
      {permissions.canManageUsers && stats.pendingUsers > 0 && (
        <div className="mb-6">
          <Link href="/users">
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 hover:bg-orange-100 transition-colors cursor-pointer">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-800">
                    {stats.pendingUsers} User
                    {stats.pendingUsers !== 1 ? "s" : ""} Awaiting Approval
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    New user registrations require your approval. Click here to
                    review.
                  </p>
                </div>
                <UserCheck className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.title === "Total Products"
                        ? "Active inventory"
                        : "Current period"}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/pos"
              className="flex items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-8 h-8 text-primary-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">New Sale</p>
                <p className="text-sm text-gray-600">Start a transaction</p>
              </div>
            </a>
            <a
              href="/products"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Package className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-600">View inventory</p>
              </div>
            </a>
            <a
              href="/sales"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Coins className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="font-semibold text-gray-900">View Sales</p>
                <p className="text-sm text-gray-600">Sales history</p>
              </div>
            </a>
            {permissions.canManageUsers && (
              <a
                href="/inventory"
                className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <TrendingDown className="w-8 h-8 text-orange-600 mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Inventory</p>
                  <p className="text-sm text-gray-600">Track losses</p>
                </div>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
