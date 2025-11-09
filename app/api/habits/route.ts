import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

// GET /api/habits - Get all habits for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const userId = user.id;

    const habits = await prisma.habit.findMany({
      where: {
        userId: userId,
      },
      // Don't include relations or date fields that might have bad data
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        scheduleType: true,
        scheduleDays: true,
        scheduledTime: true,
        parentHabitId: true,
        isParent: true,
      },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const userId = user.id;

    const body = await request.json();
    const {
      name,
      description,
      scheduleType = "daily",
      scheduleDays,
      scheduledTime,
      parentHabitId,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the habit
    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        description,
        scheduleType,
        scheduleDays,
        scheduledTime,
        parentHabitId,
        isParent: false,
      },
    });

    // If this is a subtask, update the parent
    if (parentHabitId) {
      await prisma.habit.update({
        where: { id: parentHabitId },
        data: { isParent: true },
      });
    }

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
