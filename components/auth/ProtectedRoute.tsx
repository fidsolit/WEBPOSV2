"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/lib/auth/permissions";
import toast from "react-hot-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof Permission;
  fallbackRoute?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallbackRoute = "/dashboard",
}: ProtectedRouteProps) {
  const { user, profile, loading, permissions } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        toast.error("Please login to access this page");
        router.push("/login");
        return;
      }

      // Check if user has required permission
      if (requiredPermission && !permissions[requiredPermission]) {
        toast.error("You do not have permission to access this page");
        router.push(fallbackRoute);
        return;
      }
    }
  }, [
    user,
    profile,
    loading,
    permissions,
    requiredPermission,
    router,
    fallbackRoute,
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!user) {
    return null;
  }

  // Check permission
  if (requiredPermission && !permissions[requiredPermission]) {
    return null;
  }

  return <>{children}</>;
}
