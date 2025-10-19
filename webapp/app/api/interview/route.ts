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
    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: "Analysis ID is required" },
        { status: 400 }
      );
    }

    // Fetch analysis from Firestore
    const analysisRef = db.collection("analyses").doc(analysisId);
    const analysisSnap = await analysisRef.get();

    if (!analysisSnap.exists) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    const analysis = analysisSnap.data();

    // Generate interview questions based on skill gaps and focus areas
    const questions = [
      "Tell me about yourself and your background.",
      `How would you approach solving a problem related to ${analysis.skill_gaps?.[0] || 'system design'}?`,
      "Describe a challenging project you've worked on and how you overcame obstacles.",
      `What's your experience with ${analysis.interview_focus_areas?.[0] || 'modern development practices'}?`,
      "How do you stay updated with the latest technologies in your field?",
      "Describe a time when you had to learn a new technology quickly.",
      "What questions do you have for us about the role or company?"
    ];

    // Create interview document
    const interviewId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.collection("interviews").doc(interviewId).set({
      analysisId,
      userId: user.id,
      questions,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      interviewId,
      initial_questions: questions,
    });
  } catch (error) {
    console.error("Error generating interview:", error);
    return NextResponse.json(
      { error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}
