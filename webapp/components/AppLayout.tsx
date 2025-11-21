import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { ReactNode } from "react"; // 1. Import ReactNode

export default function AppLayout({
  user,
  title,
  children, // 2. Add 'children' to the destructured props
}: {
  user: User;
  title: string;
  children: ReactNode; // 3. Define 'children' in the props type
}) {
  return (
    <div className="flex min-h-screen bg-[#050608]">
      <Sidebar user={user} />
      <main className="flex-1 ml-64">
        {/* Pass user and title to the TopBar */}
        <TopBar user={user} title={title} />
        {/* Render the children (the page content) here */}
        <div className="p-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}