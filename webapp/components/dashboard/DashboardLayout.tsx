"use client";

import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      <Navbar user={user} />
      
      <main className="pt-24 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
