"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, User, Settings, CreditCard, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth.action";
import { toast } from "sonner";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Analyses", href: "/analyses" },
  { label: "Interviews", href: "/interviews" },
  { label: "Progress", href: "/progress" },
];

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcTime = now.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        hour12: false,
      });
      setTime(`${utcTime} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    window.location.href = "/";
  };

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: User Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 group outline-none">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white font-mono group-hover:bg-white/20 transition-colors">
                {initials}
              </div>
              <span className="font-sans font-bold text-white text-lg tracking-tight">
                Prepify
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[240px] bg-black border border-white/10 rounded-xl p-2 shadow-2xl mt-2"
              sideOffset={8}
              align="start"
            >
              {/* User Info Header */}
              <div className="px-3 py-3 border-b border-white/10 mb-2">
                <p className="text-sm font-medium text-white font-sans truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 font-mono truncate">
                  {user.email}
                </p>
              </div>

              {/* Group 1: Profile & Settings */}
              <DropdownMenu.Item asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors outline-none cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors outline-none cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-white/10 my-2" />

              {/* Group 2: Subscription */}
              <DropdownMenu.Item asChild>
                <Link
                  href="/subscription"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors outline-none cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Manage Subscription
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-white/10 my-2" />

              {/* Group 3: Logout */}
              <DropdownMenu.Item
                onSelect={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors outline-none cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Center: Main Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: UTC Clock */}
        <div className="hidden md:block text-sm font-mono text-zinc-500">
          {time}
        </div>
      </div>
    </nav>
  );
}
