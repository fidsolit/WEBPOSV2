import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPermissions, Permission, UserRole } from "@/lib/auth/permissions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAuth,
  clearAuth,
  setUser,
  setProfile,
} from "@/store/slices/authSlice";
import {
  selectUser,
  selectProfile,
  selectToken,
  selectIsAuthenticated,
} from "@/store/selectors";
import {
  getTokenFromStorage,
  setTokenInStorage,
  removeTokenFromStorage,
} from "@/lib/jwt/client";
import { generateToken } from "@/lib/jwt/token";

interface AuthState {
  user: ReturnType<typeof selectUser>;
  profile: ReturnType<typeof selectProfile>;
  loading: boolean;
  permissions: Permission;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectProfile);
  const token = useAppSelector(selectToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Safety timeout - don't stay in loading state forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - forcing completion");
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      try {
        // Get current Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Session exists, verify and sync with Redux
          await loadProfile(session.user);
        } else {
          // No session, check if we have persisted Redux state
          if (isAuthenticated && user) {
            // Redux thinks we're logged in but Supabase doesn't
            // Clear everything for consistency
            console.warn("Session mismatch: Clearing stale auth state");
            removeTokenFromStorage();
            dispatch(clearAuth());
          }
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Session sync error:", error);
        removeTokenFromStorage();
        dispatch(clearAuth());
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial sync
    syncSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        removeTokenFromStorage();
        dispatch(clearAuth());
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  const loadProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Generate or retrieve JWT token
      let jwtToken = getTokenFromStorage();
      if (!jwtToken) {
        jwtToken = generateToken({
          userId: user.id,
          email: user.email,
          role: profile.role,
        });
        setTokenInStorage(jwtToken);
      }

      // Update Redux state
      dispatch(
        setAuth({
          user,
          profile,
          token: jwtToken,
        }),
      );

      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      removeTokenFromStorage();
      dispatch(clearAuth());
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    permissions: getPermissions(profile?.role as UserRole),
  } as AuthState;
}
