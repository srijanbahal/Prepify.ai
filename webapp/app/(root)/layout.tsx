import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import AppLayout from "@/components/AppLayout";
import { headers } from "next/headers";

// Helper function to get a title from the pathname
function getTitleFromPathname(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/analyze")) return "New Analysis";
  if (pathname.startsWith("/analytics")) return "Analytics";
  if (pathname.startsWith("/interviews")) return "Mock Interviews";
  if (pathname.startsWith("/profile")) return "My Profile";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/support")) return "Help & Support";
  if (pathname.startsWith("/report")) return "Analysis Report";
  if (pathname.startsWith("/feedback")) return "Interview Feedback";
  return "Prepify"; // Default
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get pathname from headers to set the title dynamically
  const headerList = await headers(); 
  const pathname = headerList.get("x-next-pathname") || "/";
  const title = getTitleFromPathname(pathname);

  const userData: User = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return (
    // This layout provides the UI for all authenticated pages
    <AppLayout user={userData} title={title}>
      {children}
    </AppLayout>
  );
}