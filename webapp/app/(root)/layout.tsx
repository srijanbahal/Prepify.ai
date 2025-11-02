import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import Navbar from "@/components/Navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Pass the user object to the Navbar */}
      <Navbar user={user} />
      <main className="root-layout">
        {children}
      </main>
    </div>
  );
}