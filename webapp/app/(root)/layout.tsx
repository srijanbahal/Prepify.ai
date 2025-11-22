import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return (
    <DashboardLayout user={userData}>
      {children}
    </DashboardLayout>
  );
}