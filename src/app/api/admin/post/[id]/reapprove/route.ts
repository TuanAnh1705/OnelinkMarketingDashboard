// app/api/admin/post/[id]/reapprove/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);
    const body = await req.json();
    
    // ✅ Có thể xóa categoryId hoặc authorId hoặc cả hai
    const { categoryId, authorId, unpublishOnly } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    // ✅ Nếu chỉ unpublish (không xóa gì)
    if (unpublishOnly) {
      const post = await prisma.blogPost.update({
        where: { id: postId },
        data: { isPublishedOnNextjs: false },
      });

      return NextResponse.json({
        success: true,
        message: "Post unpublished successfully",
        post,
      });
    }

    // ✅ Dùng transaction để xóa category/author và unpublish
    await prisma.$transaction(async (tx : any) => {
      // Xóa category nếu có
      if (categoryId) {
        await tx.postCategory.deleteMany({
          where: { postId, categoryId: Number(categoryId) },
        });
      }

      // Xóa author nếu có
      if (authorId) {
        await tx.postAuthor.deleteMany({
          where: { postId, authorId: Number(authorId) },
        });
      }

      // Unpublish post
      await tx.blogPost.update({
        where: { id: postId },
        data: { isPublishedOnNextjs: false },
      });
    });

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        categories: { include: { category: true } },
        authors: { include: { author: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post unpublished and relations removed",
      post,
    });
  } catch (err: any) {
    console.error("Error in reapprove:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}