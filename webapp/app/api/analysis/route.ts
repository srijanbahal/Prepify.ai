import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Parse request body
    const body = await req.json();
    const { resume, jobDesc, github, linkedin } = body;

    if (!resume || !jobDesc) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        resume_text: resume,
        job_description: jobDesc,
        social_profiles: {
          github: github || "",
          linkedin: linkedin || "",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Analysis failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      analysisId: data.analysis_id,
      matchScore: data.match_score,
      skillGaps: data.skill_gaps,
      strengths: data.strengths,
      recommendations: data.recommendations,
      interviewFocusAreas: data.interview_focus_areas,
      summary: data.summary,
    });
  } catch (error) {
    console.error("Error in analysis route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
