import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Convert duration string to minutes for timeline calculations.
 * Phase 3.4: Uses smaller value for ranges, caps at 240 minutes (4 hours).
 */
function convertDurationToMinutes(duration: string | null | undefined): number {
  if (!duration) return 30; // Default: 30 minutes

  const durationMap: Record<string, number> = {
    "15min": 15,
    "30min": 30,
    "1hour": 60,
    "1-2hours": 60,      // Use smaller value
    "2-4hours": 120,     // Use smaller value
    "4-8hours": 240,     // Cap at 4 hours
    "1-3days": 240,      // Cap at 4 hours
    "4-7days": 240,      // Cap at 4 hours
    "1-2weeks": 240,     // Cap at 4 hours
    "2+weeks": 240,      // Cap at 4 hours
  };

  return durationMap[duration] || 30; // Default to 30 if unrecognized
}

// GET /api/items - Get all items (tasks, habits, reminders)
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
    const itemType = searchParams.get("type"); // Filter by type if provided

    const where: any = { userId, parentItemId: null }; // Only get top-level items
    if (itemType) {
      where.itemType = itemType;
    }

    const items = await prisma.item.findMany({
      where,
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
        createdAt: "desc",
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item (task, habit, or reminder)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      itemType,
      name,
      description,
      // Habit fields
      scheduleType,
      scheduleDays,
      scheduledTime,
      // Task fields
      dueDate,
      dueTime,
      priority,
      recurrenceType,
      recurrenceInterval,
      recurrenceUnit,
      recurrenceAnchor,
      // Reminder fields
      reminderDatetime,
      reminderRecurrence,
      reminderDays,
      // Hierarchy
      parentItemId,
      // Metadata fields (Phase 3.1: renamed effort→complexity, focus→energy)
      complexity,
      duration,
      energy,
      // Phase 3.1: Task organization
      tags,
      state,
      // Phase 3.4: Calendar display
      showOnCalendar,
      // Sub-items
      subItems,
    } = body;

    // Validate required fields
    if (!itemType || !name) {
      return NextResponse.json(
        { error: "itemType and name are required" },
        { status: 400 }
      );
    }

    if (!["task", "habit", "reminder"].includes(itemType)) {
      return NextResponse.json(
        { error: "itemType must be task, habit, or reminder" },
        { status: 400 }
      );
    }

    // Check if this item will have sub-items
    const hasSubItems = Array.isArray(subItems) && subItems.length > 0;

    // Phase 3.1: Determine task state based on whether it has a date
    // If state is explicitly provided, use it; otherwise auto-determine
    let taskState = state;
    if (!taskState) {
      if (dueDate || reminderDatetime) {
        taskState = "scheduled"; // Has a date = scheduled
      } else {
        taskState = "unscheduled"; // No date = unscheduled (inbox/backlog)
      }
    }

    // Phase 3.4: Convert duration string to minutes for timeline calculations
    const durationMinutes = convertDurationToMinutes(duration);

    // Create the item
    const item = await prisma.item.create({
      data: {
        userId,
        itemType,
        name,
        description,
        scheduleType,
        scheduleDays,
        scheduledTime,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueTime,
        priority: priority || null,
        recurrenceType,
        recurrenceInterval,
        recurrenceUnit,
        recurrenceAnchor,
        reminderDatetime: reminderDatetime ? new Date(reminderDatetime) : null,
        reminderRecurrence,
        reminderDays,
        parentItemId,
        isParent: hasSubItems,
        // Phase 3.1: New fields
        state: taskState,
        tags: tags || null,
        complexity: complexity || null,
        duration: duration || null,
        durationMinutes, // Phase 3.4: Calculated minutes for timeline
        energy: energy || null,
        // Phase 3.4: Calendar display
        showOnCalendar: showOnCalendar || false,
      },
    });

    // If this is a sub-item, update the parent
    if (parentItemId) {
      await prisma.item.update({
        where: { id: parentItemId },
        data: { isParent: true },
      });
    }

    // Create sub-items if provided
    if (hasSubItems) {
      for (const subItem of subItems) {
        if (subItem.name && subItem.name.trim()) {
          await prisma.item.create({
            data: {
              userId,
              itemType, // Inherit type from parent
              name: subItem.name.trim(),
              parentItemId: item.id,
              isParent: false,
              dueDate: subItem.dueDate ? new Date(subItem.dueDate) : null,
              // Sub-items inherit state from parent
              state: taskState,
              // Sub-items don't get metadata fields
              priority: null,
              complexity: null,
              duration: null,
              energy: null,
              // Inherit schedule from parent for habits
              scheduleType: itemType === "habit" ? scheduleType : null,
              scheduleDays: itemType === "habit" ? scheduleDays : null,
            },
          });
        }
      }
    }

    // Fetch the item with sub-items included
    const itemWithSubItems = await prisma.item.findUnique({
      where: { id: item.id },
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
    });

    return NextResponse.json(itemWithSubItems, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
