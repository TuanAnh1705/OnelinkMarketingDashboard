// app/api/admin/post/[id]/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { displayOrder } = await req.json();

    if (displayOrder !== null && (typeof displayOrder !== "number" || displayOrder < 1)) {
      return NextResponse.json(
        { error: "Invalid display order. Must be a positive number or null." },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (displayOrder === null) {
      await prisma.blogPost.update({
        where: { id: postId },
        data: { displayOrder: null },
      });

      return NextResponse.json({
        success: true,
        message: "Display order cleared successfully",
      });
    }

    // ✅ LƯU TRỰC TIẾP SỐ USER NHẬP
    await prisma.blogPost.update({
      where: { id: postId },
      data: { displayOrder: displayOrder },
    });

    return NextResponse.json({
      success: true,
      message: `Post set to position ${displayOrder}`,
      displayOrder: displayOrder,
    });
  } catch (error: any) {
    console.error("Error updating display order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { displayOrder: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ displayOrder: post.displayOrder });
  } catch (error: any) {
    console.error("Error fetching display order:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}