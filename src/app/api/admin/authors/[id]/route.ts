// app/api/admin/authors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Lấy một author
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorId = parseInt(id);

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, author });
  } catch (error: any) {
    console.error("Error fetching author:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch author" },
      { status: 500 }
    );
  }
}

// PUT - Update author
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const authorId = parseInt(id);
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Author name is required" },
        { status: 400 }
      );
    }

    const author = await prisma.author.update({
      where: { id: authorId },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({ success: true, author });
  } catch (error: any) {
    console.error("Error updating author:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Author name already exists" },
        { status: 409 }
      );
    }
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update author" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa author
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const authorId = parseInt(id);

    await prisma.author.delete({
      where: { id: authorId },
    });

    return NextResponse.json({
      success: true,
      message: "Author deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting author:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete author" },
      { status: 500 }
    );
  }
}