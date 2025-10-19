import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { interview_id, conversation_history } = await request.json();

    if (!interview_id || !conversation_history) {
      return NextResponse.json(
        { error: "Interview ID and conversation history are required" },
        { status: 400 }
      );
    }

    // Fetch interview from Firestore
    const interviewRef = db.collection("interviews").doc(interview_id);
    const interviewSnap = await interviewRef.get();

    if (!interviewSnap.exists) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const interview = interviewSnap.data();

    // TODO: Call Python backend for dynamic follow-up generation
    // For now, we'll create a simple follow-up based on conversation
    const lastMessage = conversation_history[conversation_history.length - 1];
    const messageCount = conversation_history.length;

    let followupQuestion = "";

    if (messageCount <= 2) {
      followupQuestion = "That's interesting! Can you tell me more about that experience?";
    } else if (messageCount <= 4) {
      followupQuestion = "How did you handle any challenges that came up during that project?";
    } else if (messageCount <= 6) {
      followupQuestion = "What would you do differently if you had to approach that problem again?";
    } else if (messageCount <= 8) {
      followupQuestion = "That's a great example! How does this experience relate to the role you're applying for?";
    } else {
      followupQuestion = "Thank you for sharing that with me. Do you have any questions about the role or our company?";
    }

    return NextResponse.json({
      followup_question: followupQuestion,
    });
  } catch (error) {
    console.error("Error generating follow-up:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up question" },
      { status: 500 }
    );
  }
}
