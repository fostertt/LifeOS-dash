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

    // Handle sub-items if provided
    const subItems = body.subItems;
    const hasSubItems = Array.isArray(subItems) && subItems.length > 0;

    // Phase 3.4: Convert duration string to minutes for timeline calculations
    const durationMinutes = body.duration !== undefined
      ? convertDurationToMinutes(body.duration)
      : undefined;

    // Phase 3.1: Auto-update state when date changes
    let updateData: any = {
      name: body.name,
      description: body.description,
      scheduleType: body.scheduleType,
      scheduleDays: body.scheduleDays,
      scheduledTime: body.scheduledTime,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueTime: body.dueTime,
      priority: body.priority || null,
      recurrenceType: body.recurrenceType,
      recurrenceInterval: body.recurrenceInterval,
      recurrenceUnit: body.recurrenceUnit,
      recurrenceAnchor: body.recurrenceAnchor,
      reminderDatetime: body.reminderDatetime ? new Date(body.reminderDatetime) : null,
      reminderRecurrence: body.reminderRecurrence,
      reminderDays: body.reminderDays,
      complexity: body.complexity || null,
      duration: body.duration || null,
      durationMinutes, // Phase 3.4: Calculated minutes for timeline
      energy: body.energy || null,
      isParent: hasSubItems,
    };

    // Phase 3.4: Handle showOnCalendar if provided
    if (body.showOnCalendar !== undefined) {
      updateData.showOnCalendar = body.showOnCalendar;
    }

    // Phase 3.1: Handle state and tags if provided
    if (body.state !== undefined) {
      updateData.state = body.state;
    } else {
      // Auto-update state based on date changes
      if (body.dueDate || body.reminderDatetime) {
        if (existingItem.state === "unscheduled") {
          updateData.state = "scheduled"; // Adding date to unscheduled task
        }
      } else if (body.dueDate === null && body.reminderDatetime === null) {
        if (existingItem.state === "scheduled") {
          updateData.state = "unscheduled"; // Removing date from scheduled task
        }
      }
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
              dueDate: subItem.dueDate ? new Date(subItem.dueDate) : null,
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
              dueDate: subItem.dueDate ? new Date(subItem.dueDate) : null,
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
