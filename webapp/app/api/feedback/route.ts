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
    const { interviewId, transcript } = await request.json();

    if (!interviewId || !transcript) {
      return NextResponse.json(
        { error: "Interview ID and transcript are required" },
        { status: 400 }
      );
    }

    // Fetch interview from Firestore
    const interviewRef = db.collection("interviews").doc(interviewId);
    const interviewSnap = await interviewRef.get();

    if (!interviewSnap.exists) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const interview = interviewSnap.data();

    // TODO: Call Python backend for feedback analysis
    // For now, we'll create a mock response
    const mockFeedback = {
      overall_score: Math.floor(Math.random() * 30) + 70, // 70-100%
      strong_points: [
        "Clear communication and articulation",
        "Good technical knowledge demonstrated",
        "Showed enthusiasm for the role",
        "Provided concrete examples from experience"
      ],
      areas_to_improve: [
        "Could elaborate more on system design concepts",
        "Practice explaining complex technical topics simply",
        "Prepare more questions about the company/role"
      ],
      detailed_analysis: `Based on your interview performance, you demonstrated solid technical skills and good communication abilities. Your responses showed a clear understanding of the fundamentals and you provided relevant examples from your experience.

Strengths observed:
- Clear and concise communication
- Good problem-solving approach
- Relevant experience examples
- Professional demeanor throughout

Areas for improvement:
- Could benefit from more practice with system design questions
- Consider preparing more thoughtful questions about the company
- Practice explaining complex concepts in simpler terms

Overall, you performed well and showed strong potential for the role. Continue practicing technical interviews and focus on the areas mentioned above to further improve your interview skills.`
    };

    // Create feedback document
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.collection("feedback").doc(feedbackId).set({
      interviewId,
      userId: user.id,
      transcript,
      ...mockFeedback,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update interview status
    await db.collection("interviews").doc(interviewId).update({
      status: "completed",
      transcript,
      completedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      feedbackId,
      summary: mockFeedback.detailed_analysis.substring(0, 200) + "...",
    });
  } catch (error) {
    console.error("Error analyzing feedback:", error);
    return NextResponse.json(
      { error: "Failed to analyze feedback" },
      { status: 500 }
    );
  }
}
