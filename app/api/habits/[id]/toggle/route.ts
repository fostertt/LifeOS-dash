import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/habits/[id]/toggle - Toggle habit completion for a date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // AWAIT params first
    const habitId = parseInt(id);
    const { date } = await request.json();

    // Normalize to YYYY-MM-DD format, then create Date object at start of day UTC
    let dateStr: string;
    if (date) {
      dateStr = date;
    } else {
      const today = new Date();
      dateStr = today.toISOString().split("T")[0];
    }

    // Create date at start of day in UTC for consistent storage
    const completionDate = new Date(dateStr + "T00:00:00.000Z");

    // Check if already completed (use range query to handle any timezone variations)
    const startOfDay = new Date(dateStr + "T00:00:00.000Z");
    const endOfDay = new Date(dateStr + "T23:59:59.999Z");

    const existing = await prisma.habitCompletion.findFirst({
      where: {
        habitId: habitId,
        completionDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      // Remove completion
      await prisma.habitCompletion.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ completed: false });
    } else {
      // Add completion
      await prisma.habitCompletion.create({
        data: {
          habitId: habitId,
          completionDate: completionDate,
        },
      });

      return NextResponse.json({ completed: true });
    }
  } catch (error) {
    console.error("Error toggling habit:", error);
    return NextResponse.json(
      { error: "Failed to toggle habit" },
      { status: 500 }
    );
  }
}
