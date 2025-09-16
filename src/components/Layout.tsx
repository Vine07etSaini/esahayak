"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "✨ Signed out successfully",
    });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm dark:bg-slate-800/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-2 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Buyer Lead Intake
                </span>
              </Link>
              <nav className="flex items-center space-x-2">
                <Link
                  href="/buyers"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/buyers")
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-700"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>All Buyers</span>
                </Link>
                <Link
                  href="/buyers/new"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/buyers/new")
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-300 dark:hover:text-purple-400 dark:hover:bg-slate-700"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Lead</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2 border-slate-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}