// app/api/approve-post/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id, categoryIds, authorIds } = await req.json();
    const postId = Number(id);

    if (isNaN(postId) || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "id (number) và categoryIds[] là bắt buộc" },
        { status: 400 }
      );
    }

    if (authorIds && !Array.isArray(authorIds)) {
      return NextResponse.json(
        { error: "authorIds must be an array" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx : any) => {
      // 1. Xoá hết categories cũ
      await tx.postCategory.deleteMany({ where: { postId } });

      // 2. Gắn categories mới
      if (categoryIds.length > 0) {
        await tx.postCategory.createMany({
          data: categoryIds.map((cid: number) => ({
            postId,
            categoryId: Number(cid),
          })),
        });
      }

      // 3. Xóa authors cũ
      await tx.postAuthor.deleteMany({ where: { postId } });

      // 4. Gắn authors mới
      if (authorIds && authorIds.length > 0) {
        await tx.postAuthor.createMany({
          data: authorIds.map((aid: number) => ({
            postId,
            authorId: Number(aid),
          })),
        });
      }

      // 5. Cập nhật trạng thái publish
      await tx.blogPost.update({
        where: { id: postId },
        data: {
          isPublishedOnNextjs: true,
        },
      });
    });

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        categories: { include: { category: true } },
        authors: { include: { author: true } },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (err: any) {
    console.error("Error approving post:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}