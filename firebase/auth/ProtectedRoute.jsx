"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { usePathname } from "next/navigation";

// Client-side protected route wrapper for Next.js App Router pages/components.
// Usage: wrap a component or in a page: <ProtectedRoute fallbackPath="/login">{children}</ProtectedRoute>

export default function ProtectedRoute({ children, fallbackPath = "/login" }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    // You can return a spinner here
    return null;
  }

  if (!user) {
    // client-side redirect, include the requested path so login can return here
    const redirectTo = `${fallbackPath}${pathname ? `?next=${encodeURIComponent(pathname)}` : ""}`;
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
}
