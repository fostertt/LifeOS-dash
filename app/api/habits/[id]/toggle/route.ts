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

    const completionDate = date ? new Date(date) : new Date();

    // Check if already completed
    const existing = await prisma.habitCompletion.findFirst({
      where: {
        habitId: habitId,
        completionDate: completionDate,
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
