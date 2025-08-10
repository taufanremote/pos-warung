"use client";

import { useSession } from "@/lib/auth/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
    children: React.ReactNode;
}

const publicRoutes = ["/", "/auth/login", "/auth/signup"];

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isPending) {
            const isPublicRoute = publicRoutes.includes(pathname);

            if (!session && !isPublicRoute) {
                router.push("/auth/login");
            } else if (session && pathname === "/auth/login") {
                router.push("/dashboard");
            }
        }
    }, [session, isPending, pathname, router]);

    // Show loading spinner while checking auth
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login form for unauthenticated users on protected routes
    if (!session && !publicRoutes.includes(pathname)) {
        return null; // Will redirect to login
    }

    return <>{children}</>;
}