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

/**
 * Parse a date string as local date, not UTC.
 * Fixes timezone bug where "YYYY-MM-DD" gets interpreted as UTC midnight (previous day in US timezones).
 *
 * @param dateStr - Date string in "YYYY-MM-DD" format
 * @returns Date object at local midnight, or null if input is falsy
 */
function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // Split the date string and create a date at local midnight
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

// GET /api/items/[id] - Get a single item
export async function GET(
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

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId,
      },
      include: {
        completions: true,
        subItems: true,
        parent: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Update an item
export async function PATCH(
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

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Validate recurrence fields if provided
    if (body.recurrenceType) {
      if (body.recurrenceInterval !== undefined && body.recurrenceInterval < 1) {
        return NextResponse.json(
          { error: "recurrenceInterval must be >= 1" },
          { status: 400 }
        );
      }
      if (body.recurrenceType === 'weekly' && body.recurrenceAnchor) {
        const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = body.recurrenceAnchor.split(",").map((d: string) => d.trim());
        if (days.some((d: string) => !validDays.includes(d))) {
          return NextResponse.json(
            { error: "recurrenceAnchor for weekly must contain valid day names" },
            { status: 400 }
          );
        }
      }
      if (body.recurrenceType === 'monthly' && body.recurrenceAnchor) {
        const day = parseInt(body.recurrenceAnchor);
        if (isNaN(day) || day < 1 || day > 31) {
          return NextResponse.json(
            { error: "recurrenceAnchor for monthly must be a day number 1-31" },
            { status: 400 }
          );
        }
      }
    }

    // Handle sub-items if provided
    const subItems = body.subItems;
    const hasSubItems = Array.isArray(subItems) && subItems.length > 0;

    // Phase 3.4: Convert duration string to minutes for timeline calculations
    const durationMinutes = body.duration !== undefined
      ? convertDurationToMinutes(body.duration)
      : undefined;

    // Phase 3.1: Auto-update state when date changes
    // Build updateData object with only provided fields to avoid clearing existing values
    let updateData: any = {};

    // Only include fields that are present in the request body
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.scheduleType !== undefined) updateData.scheduleType = body.scheduleType;
    if (body.scheduleDays !== undefined) updateData.scheduleDays = body.scheduleDays;
    if (body.scheduledTime !== undefined) updateData.scheduledTime = body.scheduledTime;
    if (body.dueDate !== undefined) updateData.dueDate = parseLocalDate(body.dueDate);
    if (body.dueTime !== undefined) updateData.dueTime = body.dueTime;
    if (body.priority !== undefined) updateData.priority = body.priority || null;
    if (body.recurrenceType !== undefined) updateData.recurrenceType = body.recurrenceType;
    if (body.recurrenceInterval !== undefined) updateData.recurrenceInterval = body.recurrenceInterval;
    if (body.recurrenceUnit !== undefined) updateData.recurrenceUnit = body.recurrenceUnit;
    if (body.recurrenceAnchor !== undefined) updateData.recurrenceAnchor = body.recurrenceAnchor;
    if (body.reminderDatetime !== undefined) updateData.reminderDatetime = body.reminderDatetime ? new Date(body.reminderDatetime) : null;
    if (body.reminderRecurrence !== undefined) updateData.reminderRecurrence = body.reminderRecurrence;
    if (body.reminderDays !== undefined) updateData.reminderDays = body.reminderDays;
    if (body.complexity !== undefined) updateData.complexity = body.complexity || null;
    if (body.duration !== undefined) {
      updateData.duration = body.duration || null;
      updateData.durationMinutes = convertDurationToMinutes(body.duration);
    }
    if (body.energy !== undefined) updateData.energy = body.energy || null;
    if (hasSubItems) updateData.isParent = true;

    // Phase 3.10: Handle isOverdue flag
    // Allow explicit setting/clearing via API
    if (body.isOverdue !== undefined) {
      updateData.isOverdue = body.isOverdue;
    }

    // Phase 3.4: Handle showOnCalendar if provided
    if (body.showOnCalendar !== undefined) {
      updateData.showOnCalendar = body.showOnCalendar;
    }

    // Phase 3.1: Handle state and tags if provided
    // ADR-019: 3-state model (backlog, active, completed)
    if (body.state !== undefined) {
      updateData.state = body.state;

      // ADR-012 Rule: Backlog cannot have dates
      if (body.state === "backlog") {
        updateData.dueDate = null;
        updateData.dueTime = null;
        updateData.showOnCalendar = false;
        // Phase 3.10: Clear overdue flag when moved to backlog
        updateData.isOverdue = false;
      }

      // Phase 3.10: Clear overdue flag when completed
      if (body.state === "completed") {
        updateData.isOverdue = false;
      }
    } else {
      // Auto-update state based on date changes (ADR-012)
      if (body.dueDate || body.reminderDatetime) {
        // Adding date to backlog task → auto-move to active
        if (existingItem.state === "backlog") {
          updateData.state = "active";
        }
      } else if (body.dueDate === null && body.reminderDatetime === null) {
        // Removing date from active task → stays active (doesn't auto-move to backlog)
        // User must explicitly move to backlog if desired
      }
    }

    // Phase 3.10: Also clear isOverdue if isCompleted is being set to true
    if (body.isCompleted === true) {
      updateData.isCompleted = body.isCompleted;
      updateData.isOverdue = false;
    } else if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
    }

    if (body.tags !== undefined) {
      updateData.tags = body.tags;
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    });

    // Manage sub-items if provided
    if (Array.isArray(subItems)) {
      // Get existing sub-items
      const existingSubItems = await prisma.item.findMany({
        where: { parentItemId: itemId },
      });

      const existingSubItemIds = existingSubItems.map((si) => si.id);
      const providedSubItemIds = subItems
        .filter((si: any) => si.id)
        .map((si: any) => si.id);

      // Delete sub-items that are no longer in the list
      const subItemsToDelete = existingSubItemIds.filter(
        (id) => !providedSubItemIds.includes(id)
      );
      if (subItemsToDelete.length > 0) {
        // Delete completions first
        await prisma.itemCompletion.deleteMany({
          where: { itemId: { in: subItemsToDelete } },
        });
        await prisma.item.deleteMany({
          where: { id: { in: subItemsToDelete } },
        });
      }

      // Update or create sub-items
      for (const subItem of subItems) {
        if (subItem.id) {
          // Update existing sub-item
          await prisma.item.update({
            where: { id: subItem.id },
            data: {
              name: subItem.name?.trim() || "",
              dueDate: parseLocalDate(subItem.dueDate), // Use local date parsing
            },
          });
        } else if (subItem.name && subItem.name.trim()) {
          // Create new sub-item
          await prisma.item.create({
            data: {
              userId,
              itemType: existingItem.itemType,
              name: subItem.name.trim(),
              parentItemId: itemId,
              isParent: false,
              dueDate: parseLocalDate(subItem.dueDate), // Use local date parsing
              state: existingItem.state, // Inherit state from parent
              priority: null,
              complexity: null,
              duration: null,
              energy: null,
              scheduleType:
                existingItem.itemType === "habit"
                  ? existingItem.scheduleType
                  : null,
              scheduleDays:
                existingItem.itemType === "habit"
                  ? existingItem.scheduleDays
                  : null,
            },
          });
        }
      }
    }

    // Fetch the updated item with sub-items
    const itemWithSubItems = await prisma.item.findUnique({
      where: { id: itemId },
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

    return NextResponse.json(itemWithSubItems);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
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

    // Check if item exists and belongs to user
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete all completions first
    await prisma.itemCompletion.deleteMany({
      where: { itemId },
    });

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
