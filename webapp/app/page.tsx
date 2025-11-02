import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/lib/firebase/admin";
import AnalysisCard from "@/components/AnalysisCard";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar"; // Import the main Navbar

// THIS IS THE FIX:
// Force this page to be dynamically rendered on every request.
// This ensures getCurrentUser() always runs and sees the new cookie.
export const dynamic = 'force-dynamic';

/**
 * Main dashboard page, shown when the user is logged in.
 */
async function Dashboard({ user }: { user: User }) {
  // Fetch user's analyses from Firestore
  const analysesRef = db
    .collection("analyses")
    .where("userId", "==", user.id)
    .orderBy("createdAt", "desc");

  const snapshot = await analysesRef.get();

  const analyses = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate()
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString(),
    };
  }) as (Omit<Analysis, "createdAt"> & { createdAt: string })[];

  return (
    <div className="min-h-screen bg-background">
      {/* Use the consistent Navbar component, passing the user */}
      <Navbar user={user} />

      <main className="root-layout">
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
            {/* This button is also in the Navbar, but good for a main CTA */}
            <Link href="/analyze" className="btn-primary hidden md:flex">
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
      </main>
    </div>
  );
}

/**
 * Landing page, shown when the user is logged out.
 */
function LoggedOutLandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Use the consistent Navbar component (it will show Sign In/Up) */}
      <Navbar />

      {/* Main Page Section */}
      <main className="flex-1 flex items-center justify-center text-center root-layout">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-5xl font-bold text-primary-100">
            Practice Job Interviews with AI
          </h1>
          <p className="text-xl text-light-100 max-w-2xl">
            Prepify.ai analyzes your resume, job description, and social
            profiles to give you personalized mock interviews and career
            guidance.
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg" className="btn-primary !px-8 !py-6 !text-lg">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="btn-secondary !px-8 !py-6 !text-lg">
              {/* You can link this to a future "features" section */}
              <Link href="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Root Page: Conditionally renders dashboard or landing page
 * based on authentication state.
 */
export default async function Page() {
  const user = await getCurrentUser();
  console.log("Current User in Page:", user);
  if (!user) {
    return <LoggedOutLandingPage />;
  }

  // Pass a serializable user object to the Dashboard
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return <Dashboard user={userData} />;
}