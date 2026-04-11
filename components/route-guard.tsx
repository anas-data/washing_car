import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Route Guard Component
 * 
 * Protects routes by checking authentication status.
 * - If requireAuth is true, redirects to login if not authenticated
 * - Shows loading state while checking auth
 * - Allows guest access if requireAuth is false
 */
export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      // User is not authenticated and this route requires auth
      router.replace("/login");
    }
  }, [loading, isAuthenticated, requireAuth, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // User is authenticated or auth is not required, render children
  return <>{children}</>;
}
