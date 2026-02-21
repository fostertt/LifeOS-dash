import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/calendar/items
 *
 * Fetches items for Calendar view, categorized into sections.
 * Query params:
 *   - date: YYYY-MM-DD format (required) - the date to fetch items for
 *
 * Returns:
 * {
 *   reminders: Item[]       // Reminders with date <= today
 *   overdue: Item[]         // Scheduled tasks with date < today
 *   scheduled: Item[]       // Tasks scheduled for the specified date (with time)
 *   scheduledNoTime: Item[] // Tasks scheduled for the specified date (without time)
 *   pinned: Item[]          // Tasks with showOnCalendar=true
 *   backlog: Item[]         // Tasks with state='backlog'
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "date parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Parse the date (YYYY-MM-DD format from client)
    // This represents the date the user is viewing, in their local timezone
    const targetDateStr = dateParam; // Already in YYYY-MM-DD format

    // Helper to format date for comparison (YYYY-MM-DD)
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Parse dates for database queries
    // For "today" in terms of overdue calculation, use the target date
    // (items before the date being viewed are overdue relative to that view)
    const targetDate = new Date(dateParam + 'T00:00:00.000Z');
    const today = new Date();

    // Fetch all items that might be relevant for Calendar view
    // We'll categorize them in-memory for now (can optimize with separate queries later)
    const allItems = await prisma.item.findMany({
      where: {
        userId,
        parentItemId: null, // Top-level items only
        OR: [
          // Reminders with date <= target date
          {
            itemType: "reminder",
            dueDate: {
              lte: targetDate,
            },
          },
          // Tasks in 'active' state (ADR-019: only 3 states now)
          {
            itemType: "task",
            state: "active",
          },
          // Tasks in 'backlog' state
          {
            itemType: "task",
            state: "backlog",
          },
          // Habits (all daily habits or those scheduled for today)
          {
            itemType: "habit",
          },
          // Items pinned to calendar
          {
            showOnCalendar: true,
          },
        ],
      },
      include: {
        completions: true,
        subItems: {
          include: {
            completions: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Phase 3.10: Auto-set isOverdue flag for tasks that have become overdue
    // Check for tasks that should be marked as overdue but aren't yet
    const tasksToMarkOverdue = allItems.filter((item) => {
      return (
        item.state === "active" &&
        item.dueDate &&
        !item.isCompleted &&
        !item.isOverdue && // Not already marked
        formatDate(new Date(item.dueDate)) < formatDate(today) // Date has passed
      );
    });

    // Update those tasks in the database
    if (tasksToMarkOverdue.length > 0) {
      const idsToUpdate = tasksToMarkOverdue.map((item) => item.id);
      await prisma.item.updateMany({
        where: {
          id: { in: idsToUpdate },
        },
        data: {
          isOverdue: true,
        },
      });

      // Update the in-memory items as well
      tasksToMarkOverdue.forEach((item) => {
        item.isOverdue = true;
      });
    }

    // Helper: check if a habit is scheduled for a given date
    const isHabitScheduledForDate = (item: any, date: Date): boolean => {
      const jsDay = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      if (item.scheduleType === "daily") return true;
      if (item.scheduleType === "weekdays") return jsDay >= 1 && jsDay <= 5;
      if (item.scheduleType === "weekends") return jsDay === 0 || jsDay === 6;
      if (item.scheduleType === "specific_days" && item.scheduleDays) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const todayName = dayNames[jsDay];
        return item.scheduleDays.split(",").map((d: string) => d.trim()).includes(todayName);
      }
      if (item.scheduleType === "weekly" && item.scheduleDays) {
        const scheduledDays = item.scheduleDays.split(",").map((d: string) => parseInt(d.trim()));
        const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon format
        return scheduledDays.includes(dayIndex);
      }
      // Default: show daily habits
      return item.scheduleType != null;
    };

    // Categorize items
    const reminders: any[] = [];
    const overdue: any[] = [];
    const scheduled: any[] = [];
    const scheduledNoTime: any[] = [];
    const pinned: any[] = [];
    const backlog: any[] = [];
    const habits: any[] = [];

    for (const item of allItems) {
      // Skip completed items (unless they're reminders or pinned)
      const isCompleted = item.isCompleted || false;

      // Habits: check if scheduled for target date
      if (item.itemType === "habit") {
        if (isHabitScheduledForDate(item, targetDate)) {
          habits.push(item);
        }
        continue;
      }

      // Reminders: itemType='reminder' AND date <= target date being viewed
      if (item.itemType === "reminder" && item.dueDate) {
        const itemDateStr = formatDate(new Date(item.dueDate));
        if (itemDateStr <= targetDateStr) {
          reminders.push(item);
          continue;
        }
      }

      // Skip completed tasks for other categories
      if (isCompleted && item.itemType === "task") {
        // Completed tasks don't show unless pinned
        if (item.showOnCalendar) {
          pinned.push(item);
        }
        continue;
      }

      // Backlog
      if (item.state === "backlog") {
        backlog.push(item);
        continue;
      }

      // Phase 3.10: Overdue - use persistent isOverdue flag
      // Items with isOverdue=true appear in overdue section
      // BUT also appear in their scheduled time (don't continue - let them fall through)
      if (item.isOverdue && !isCompleted) {
        overdue.push(item);
        // Don't continue - let overdue items also appear in scheduled sections
      }

      // Per-date recurring tasks/reminders: check if scheduled for target date
      if (item.recurrenceType && ['daily', 'weekly', 'monthly'].includes(item.recurrenceType) && !isCompleted) {
        let matchesDate = false;
        if (item.recurrenceType === 'daily') {
          matchesDate = true;
        } else if (item.recurrenceType === 'weekly' && item.recurrenceAnchor) {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const targetDayName = dayNames[targetDate.getUTCDay()];
          matchesDate = item.recurrenceAnchor.split(",").map((d: string) => d.trim()).includes(targetDayName);
        } else if (item.recurrenceType === 'monthly' && item.recurrenceAnchor) {
          matchesDate = targetDate.getUTCDate() === parseInt(item.recurrenceAnchor);
        }

        if (matchesDate) {
          if (item.dueTime) {
            scheduled.push(item);
          } else {
            scheduledNoTime.push(item);
          }
          continue;
        }
      }

      // Scheduled: active + has date
      if (item.state === "active" && item.dueDate && !isCompleted) {
        const itemDate = new Date(item.dueDate);
        itemDate.setHours(0, 0, 0, 0);
        const itemDateStr = formatDate(itemDate);

        // Scheduled for the target date being viewed
        if (itemDateStr === targetDateStr) {
          if (item.dueTime) {
            scheduled.push(item);
          } else {
            scheduledNoTime.push(item);
          }
          continue;
        }
      }

      // Pinned items (showOnCalendar=true)
      if (item.showOnCalendar && !isCompleted) {
        // Only add if not already in another category
        const alreadyCategorized =
          reminders.includes(item) ||
          overdue.includes(item) ||
          scheduled.includes(item) ||
          scheduledNoTime.includes(item) ||
          backlog.includes(item);

        if (!alreadyCategorized) {
          pinned.push(item);
        }
      }
    }

    // Sort scheduled items by time
    scheduled.sort((a, b) => {
      const timeA = a.dueTime || "23:59";
      const timeB = b.dueTime || "23:59";
      return timeA.localeCompare(timeB);
    });

    // Sort overdue by original due date (oldest first)
    overdue.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    // Sort habits by scheduledTime
    habits.sort((a, b) => {
      const timeA = a.scheduledTime || "23:59";
      const timeB = b.scheduledTime || "23:59";
      return timeA.localeCompare(timeB);
    });

    return NextResponse.json({
      reminders,
      overdue,
      scheduled,
      scheduledNoTime,
      pinned,
      backlog,
      habits,
    });
  } catch (error) {
    console.error("Error fetching calendar items:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error details:", errorMessage, errorStack);
    return NextResponse.json(
      {
        error: "Failed to fetch calendar items",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
