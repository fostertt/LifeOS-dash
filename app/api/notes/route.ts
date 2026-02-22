import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/notes - Get all notes for the authenticated user
 * Returns notes ordered by pinned status (pinned first), then by creation date (newest first)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: [
        { pinned: "desc" },  // Pinned notes first
        { createdAt: "desc" } // Then newest first
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes - Create a new note
 * Body: { title?: string, content?: string, tags?: string[], pinned?: boolean, color?: string, source?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const { title, content, tags, pinned, color, source } = body;

    // At least title or content is required
    if ((!title || title.trim() === "") && (!content || content.trim() === "")) {
      return NextResponse.json(
        { error: "Title or content is required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        userId,
        title: title || null,
        content: content || null,
        tags: tags || null,
        pinned: pinned || false,
        color: color || null,
        // ADR-020: Inbox source tracking — notes with a source start unreviewed
        source: source || null,
        reviewedAt: source ? null : new Date(),
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
