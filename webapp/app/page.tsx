"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/Overview";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      setUser({
        id: currentUser.uid,
        name: currentUser.displayName || "User",
        email: currentUser.email,
        image: currentUser.photoURL,
      });

      try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch("http://localhost:8000/dashboard", {
          headers: {
            "Authorization": `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <DashboardOverview 
        user={user} 
        analyses={dashboardData?.recent_analyses || []} 
        stats={dashboardData?.stats}
      />
    </DashboardLayout>
  );
}