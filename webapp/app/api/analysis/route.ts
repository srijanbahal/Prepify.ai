import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { resume, jobDesc, github, linkedin } = await request.json();

    if (!resume || !jobDesc) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    // TODO: Call Python backend API
    // For now, we'll create a mock response
    const mockAnalysis = {
      match_score: Math.floor(Math.random() * 40) + 60, // 60-100%
      skill_gaps: [
        "Advanced Python frameworks (Django/FastAPI)",
        "Cloud deployment (AWS/Azure)",
        "System design principles"
      ],
      strengths: [
        "Strong programming fundamentals",
        "Good problem-solving skills",
        "Experience with version control"
      ],
      recommendations: [
        "Practice system design questions",
        "Learn a cloud platform (AWS recommended)",
        "Build a portfolio project with modern frameworks"
      ],
      interview_focus_areas: [
        "Technical coding problems",
        "System architecture discussions",
        "Experience with modern frameworks",
        "Problem-solving approach"
      ]
    };

    // Save to Firestore
    const analysisRef = await db.collection("analyses").add({
      userId: user.id,
      resume_text: resume,
      job_description: jobDesc,
      social_profiles: {
        github: github || null,
        linkedin: linkedin || null,
      },
      ...mockAnalysis,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      analysisId: analysisRef.id,
      ...mockAnalysis,
    });
  } catch (error) {
    console.error("Error creating analysis:", error);
    return NextResponse.json(
      { error: "Failed to create analysis" },
      { status: 500 }
    );
  }
}
