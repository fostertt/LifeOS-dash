import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/items/[id]/toggle - Toggle item completion for a specific date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    const itemId = parseInt(id);
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { error: "date is required" },
        { status: 400 }
      );
    }

    // Check if item exists and belongs to user
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId,
      },
      include: {
        subItems: {
          include: {
            completions: true,
          },
        },
        listItem: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Determine completion model:
    // Per-date recurring (habits, daily/weekly/monthly tasks): use ItemCompletion table
    // Advancing recurring (every_n_days, every_n_weeks, days_after_completion): advance dueDate
    const isPerDateRecurring = item.scheduleType && item.scheduleType !== "";
    const isAdvancingRecurring = item.recurrenceType &&
      ['every_n_days', 'every_n_weeks', 'days_after_completion'].includes(item.recurrenceType);

    if (isAdvancingRecurring) {
      // Advancing recurrence: complete, record history, then advance dueDate and uncomplete
      const isCompleting = !item.isCompleted;

      if (isCompleting) {
        const now = new Date();
        const completionDate = new Date(date);
        const interval = item.recurrenceInterval || 1;

        // Calculate next due date based on recurrence type
        let nextDueDate: Date;
        if (item.recurrenceType === 'every_n_days') {
          const currentDue = item.dueDate ? new Date(item.dueDate) : now;
          nextDueDate = new Date(currentDue);
          nextDueDate.setDate(nextDueDate.getDate() + interval);
        } else if (item.recurrenceType === 'every_n_weeks') {
          const currentDue = item.dueDate ? new Date(item.dueDate) : now;
          nextDueDate = new Date(currentDue);
          nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
        } else {
          // days_after_completion: N days from today
          nextDueDate = new Date(now);
          nextDueDate.setDate(nextDueDate.getDate() + interval);
        }
        // Normalize to midnight
        nextDueDate.setHours(0, 0, 0, 0);

        // Record completion history
        await prisma.itemCompletion.create({
          data: {
            itemId,
            completionDate,
          },
        });

        // Advance dueDate, keep item uncompleted for next occurrence
        await prisma.item.update({
          where: { id: itemId },
          data: {
            isCompleted: false,
            completedAt: null,
            dueDate: nextDueDate,
            // Clear overdue flag since it's been handled
            isOverdue: false,
          },
        });

        return NextResponse.json({
          completed: true,
          advanced: true,
          nextDueDate: nextDueDate.toISOString().split('T')[0],
        });
      } else {
        // Uncompleting an advancing task — just toggle back (edge case, shouldn't happen often)
        await prisma.item.update({
          where: { id: itemId },
          data: {
            isCompleted: false,
            completedAt: null,
          },
        });
        return NextResponse.json({ completed: false });
      }
    } else if (isPerDateRecurring) {
      // For recurring items (habits): use ItemCompletion table to track by date
      const completionDate = new Date(date);

      // Check if completion exists for this date
      const existingCompletion = await prisma.itemCompletion.findFirst({
        where: {
          itemId,
          completionDate,
        },
      });

      if (existingCompletion) {
        // Remove completion
        await prisma.itemCompletion.delete({
          where: {
            id: existingCompletion.id,
          },
        });

        return NextResponse.json({ completed: false });
      } else {
        // Check if this is a parent with incomplete sub-items
        if (item.isParent && item.subItems && item.subItems.length > 0) {
          // For recurring items, check if all sub-items have completions for this date
          const incompleteSubItems = item.subItems.filter((subItem) => {
            const hasCompletionForDate = subItem.completions.some(
              (c) =>
                new Date(c.completionDate).toDateString() ===
                completionDate.toDateString()
            );
            return !hasCompletionForDate;
          });

          if (incompleteSubItems.length > 0) {
            return NextResponse.json(
              {
                error: "Cannot complete parent item until all sub-items are completed",
                incompleteCount: incompleteSubItems.length,
              },
              { status: 400 }
            );
          }
        }

        // Add completion
        await prisma.itemCompletion.create({
          data: {
            itemId,
            completionDate,
          },
        });

        return NextResponse.json({ completed: true });
      }
    } else {
      // For non-recurring items (tasks/reminders): toggle isCompleted field
      const newCompletedState = !item.isCompleted;

      // Check if this is a parent with incomplete sub-items (only when trying to complete)
      if (
        newCompletedState &&
        item.isParent &&
        item.subItems &&
        item.subItems.length > 0
      ) {
        const incompleteSubItems = item.subItems.filter(
          (subItem) => !subItem.isCompleted
        );

        if (incompleteSubItems.length > 0) {
          return NextResponse.json(
            {
              error: "Cannot complete parent item until all sub-items are completed",
              incompleteCount: incompleteSubItems.length,
            },
            { status: 400 }
          );
        }
      }

      await prisma.item.update({
        where: { id: itemId },
        data: {
          isCompleted: newCompletedState,
          completedAt: newCompletedState ? new Date().toISOString() : null,
          // Move to completed state when checked, restore to active when unchecked
          state: newCompletedState ? "completed" : (item.state === "completed" ? "active" : item.state),
        },
      });

      // Sync with linked list item if exists
      if (item.listItem) {
        await prisma.listItem.update({
          where: { id: item.listItem.id },
          data: { isChecked: newCompletedState },
        });
      }

      return NextResponse.json({ completed: newCompletedState });
    }
  } catch (error) {
    console.error("Error toggling item completion:", error);
    return NextResponse.json(
      { error: "Failed to toggle item completion" },
      { status: 500 }
    );
  }
}
