import { NextResponse } from "next/server";
import { ensureDailyQuiz } from "@/lib/data/quiz";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const quizDate = new Date().toISOString().slice(0, 10);
  const questionIds = await ensureDailyQuiz(quizDate);

  return NextResponse.json({ quiz_date: quizDate, question_ids: questionIds });
}
