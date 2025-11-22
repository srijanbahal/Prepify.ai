"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  TrendingUp,
  User as UserIcon, // 1. Renamed the imported icon to "UserIcon"
} from "lucide-react";

interface SidebarProps {
  user: any; // 2. Now "User" correctly refers to your global type
}

// 3. Updated navigation links
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Analysis", href: "/analyze", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Mock Interviews", href: "/interviews", icon: MessageSquare },
  { name: "My Profile", href: "/profile", icon: UserIcon }, // 4. Use the aliased "UserIcon"
];

const secondaryNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/support", icon: HelpCircle },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Prepify
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 mt-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-lg shadow-white/5"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="pt-6 space-y-1">
          <p className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            General
          </p>
          {secondaryNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade Card */}
      <div className="p-4 border-t border-white/10">
        <div className="rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">
              Upgrade to Pro
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            Unlock unlimited interviews and advanced analytics
          </p>
          <button className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}