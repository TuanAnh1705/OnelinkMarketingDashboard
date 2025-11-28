// app/api/admin/authors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Lấy tất cả authors
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ success: true, authors });
  } catch (error: any) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch authors" },
      { status: 500 }
    );
  }
}

// POST - Tạo author mới
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Author name is required" },
        { status: 400 }
      );
    }

    const author = await prisma.author.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({ success: true, author });
  } catch (error: any) {
    console.error("Error creating author:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Author name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create author" },
      { status: 500 }
    );
  }
}