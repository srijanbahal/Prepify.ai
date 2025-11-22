import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/lib/firebase/admin";
import LandingPage from "@/components/landing";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardOverview from "@/components/dashboard/Overview";

export const dynamic = "force-dynamic";

async function getAnalyses(userId: string) {
  try {
    const analysesRef = db
      .collection("analyses")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    const snapshot = await analysesRef.get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return [];
  }
}

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    return <LandingPage />;
  }

  const analyses = await getAnalyses(user.id);

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return (
    <DashboardLayout user={userData}>
      <DashboardOverview user={userData} analyses={analyses} />
    </DashboardLayout>
  );
}