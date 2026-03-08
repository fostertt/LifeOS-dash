import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects - Get all projects for the authenticated user
 * Includes active task count for each project.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            tasks: {
              where: { isCompleted: false, parentItemId: null },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

/**
 * POST /api/projects - Create a new project
 * Body: { name, description?, status?, targetDate?, tags? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, description, status, targetDate, tags } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId,
        name: name.trim(),
        description: description || null,
        status: status || "active",
        targetDate: targetDate ? new Date(targetDate) : null,
        tags: tags || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
