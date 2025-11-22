import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    // Get Firebase ID token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Parse body
    const body = await req.json();
    const { interviewId, transcript } = body;

    if (!interviewId || !transcript) {
      return NextResponse.json(
        { error: "Interview ID and transcript are required" },
        { status: 400 }
      );
    }

    // Forward to FastAPI
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/feedback/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        interview_id: interviewId,
        transcript: transcript,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Feedback analysis failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      feedbackId: data.feedback_id,
      summary: data.summary,
      overallScore: data.overall_score,
      strongPoints: data.strong_points,
      areasToImprove: data.areas_to_improve,
      detailedAnalysis: data.detailed_analysis,
    });
  } catch (error) {
    console.error("Error in feedback route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
