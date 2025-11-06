import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/habits/[id] - Get a single habit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = parseInt(params.id);

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        completions: true,
        subTasks: true,
        parent: true,
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit' },
      { status: 500 }
    );
  }
}

// PATCH /api/habits/[id] - Update a habit
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = parseInt(params.id);
    const body = await request.json();

    const habit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const habitId = parseInt(params.id);

    await prisma.habit.delete({
      where: { id: habitId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
