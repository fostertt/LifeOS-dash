import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/inbox
 *
 * Returns all unreviewed items across Item, Note, and List models.
 * Unreviewed = source IS NOT NULL AND reviewedAt IS NULL.
 * Results are merged and sorted by createdAt desc.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Query all three models in parallel for unreviewed items
    const [items, notes, lists] = await Promise.all([
      prisma.item.findMany({
        where: {
          userId,
          source: { not: null },
          reviewedAt: null,
        },
        include: {
          subItems: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.note.findMany({
        where: {
          userId,
          source: { not: null },
          reviewedAt: null,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.list.findMany({
        where: {
          userId,
          source: { not: null },
          reviewedAt: null,
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Tag each result with its model type and normalize for the frontend
    const inboxItems = [
      ...items.map((item) => ({
        id: item.id,
        modelType: "item" as const,
        title: item.name,
        description: item.description,
        source: item.source,
        state: item.state,
        itemType: item.itemType,
        tags: item.tags,
        createdAt: item.createdAt,
      })),
      ...notes.map((note) => ({
        id: note.id,
        modelType: "note" as const,
        title: note.title || "Untitled Note",
        description: note.content?.slice(0, 120) || null,
        source: note.source,
        state: null,
        itemType: "note" as const,
        tags: note.tags,
        createdAt: note.createdAt,
      })),
      ...lists.map((list) => ({
        id: list.id,
        modelType: "list" as const,
        title: list.name,
        description: `${list.items.length} item${list.items.length !== 1 ? "s" : ""}`,
        source: list.source,
        state: null,
        itemType: "list" as const,
        tags: list.tags,
        createdAt: list.createdAt,
      })),
    ];

    // Sort all by createdAt desc
    inboxItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      items: inboxItems,
      count: inboxItems.length,
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inbox
 *
 * Confirms (reviews) an inbox item. Sets reviewedAt = now().
 * Body: { modelType: "item"|"note"|"list", id: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { modelType, id } = body;

    if (!modelType || !id) {
      return NextResponse.json(
        { error: "modelType and id are required" },
        { status: 400 }
      );
    }

    const now = new Date();

    switch (modelType) {
      case "item":
        await prisma.item.update({
          where: { id },
          data: { reviewedAt: now },
        });
        break;
      case "note":
        await prisma.note.update({
          where: { id },
          data: { reviewedAt: now },
        });
        break;
      case "list":
        await prisma.list.update({
          where: { id },
          data: { reviewedAt: now },
        });
        break;
      default:
        return NextResponse.json(
          { error: "modelType must be item, note, or list" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming inbox item:", error);
    return NextResponse.json(
      { error: "Failed to confirm inbox item" },
      { status: 500 }
    );
  }
}
