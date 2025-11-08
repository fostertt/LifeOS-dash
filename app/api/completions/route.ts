import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/completions?date=YYYY-MM-DD - Get all completions for a specific date
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth
    const userId = "48868489";

    // Get date from query params, default to today
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Set to start of day to match completion dates
    targetDate.setHours(0, 0, 0, 0);

    // Get all habits for this user
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true },
    });

    const habitIds = habits.map((h) => h.id);

    // Get completions for these habits on the target date
    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: { in: habitIds },
        completionDate: targetDate,
      },
      select: {
        habitId: true,
      },
    });

    // Return array of completed habit IDs
    const completedHabitIds = completions.map((c) => c.habitId);

    return NextResponse.json({ completedHabitIds, date: targetDate });
  } catch (error) {
    console.error("Error fetching completions:", error);
    return NextResponse.json(
      { error: "Failed to fetch completions" },
      { status: 500 }
    );
  }
}
