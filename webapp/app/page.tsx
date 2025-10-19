import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/lib/firebase/admin";
import AnalysisCard from "@/components/AnalysisCard";

export default async function Dashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    // This case should be handled by the layout, but it's good practice
    return null;
  }

  // Fetch user's analyses from Firestore
  const analysesRef = db.collection("analyses")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc");
  
  const snapshot = await analysesRef.get();
  
  // Modify the mapping to convert Date to a string
  const analyses = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Timestamp to a serializable ISO string
      createdAt: data.createdAt?.toDate() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    };
  }) as (Omit<Analysis, 'createdAt'> & { createdAt: string })[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary-100">
            Welcome back, {user.name}!
          </h1>
          <p className="text-light-100 mt-2">
            Ready to ace your next interview? Let's analyze your profile.
          </p>
        </div>
        <Link href="/analyze" className="btn-primary">
          New Analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="card-border">
          <div className="card p-12 text-center">
            <h3 className="text-2xl font-semibold text-primary-100 mb-4">
              No analyses yet
            </h3>
            <p className="text-light-100 mb-6">
              Get started by creating your first career analysis
            </p>
            <Link href="/analyze" className="btn-primary">
              Create Analysis
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      )}
    </div>
  );
}