import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notes/[id] - Get a single note by ID
 * Returns 404 if note doesn't exist or doesn't belong to user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = parseInt(id);
    const userId = session.user.id;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

/**
 * PATCH /api/notes/[id] - Update a note
 * Body: { title?: string, content?: string, tags?: string[], pinned?: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = parseInt(id);
    const userId = session.user.id;
    const body = await request.json();

    const existingNote = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title || null;
    if (body.content !== undefined) {
      if (!body.content || body.content.trim() === "") {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      updateData.content = body.content;
    }
    if (body.tags !== undefined) updateData.tags = body.tags || null;
    if (body.pinned !== undefined) updateData.pinned = body.pinned;

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: updateData,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

/**
 * DELETE /api/notes/[id] - Delete a note
 * Returns { success: true } on successful deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = parseInt(id);
    const userId = session.user.id;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
