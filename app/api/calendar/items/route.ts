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
 *   inProgress: Item[]      // Tasks with state='in_progress'
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
          // Tasks in 'active' state (formerly scheduled)
          {
            itemType: "task",
            state: "active",
          },
          // Tasks in 'in_progress' state
          {
            itemType: "task",
            state: "in_progress",
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

    // Categorize items
    const reminders: any[] = [];
    const overdue: any[] = [];
    const inProgress: any[] = [];
    const scheduled: any[] = [];
    const scheduledNoTime: any[] = [];
    const pinned: any[] = [];
    const backlog: any[] = [];

    for (const item of allItems) {
      // Skip completed items (unless they're reminders or pinned)
      const isCompleted = item.isCompleted || false;

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

      // In Progress: Always show on today
      if (item.state === "in_progress") {
        inProgress.push(item);
        continue;
      }

      // Overdue: active + date < target date + not completed
      if (item.state === "active" && item.dueDate && !isCompleted) {
        const itemDate = new Date(item.dueDate);
        itemDate.setHours(0, 0, 0, 0);
        const itemDateStr = formatDate(itemDate);

        // Only overdue if date is BEFORE the date being viewed (not equal to it)
        if (itemDateStr < targetDateStr) {
          overdue.push(item);
          continue;
        }

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
          inProgress.includes(item) ||
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

    return NextResponse.json({
      reminders,
      overdue,
      inProgress,
      scheduled,
      scheduledNoTime,
      pinned,
      backlog,
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
