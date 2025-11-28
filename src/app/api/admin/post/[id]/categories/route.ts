// app/api/admin/post/[id]/categories/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET: lấy tất cả categories + authors + đã gắn cho post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);

    // ✅ Lấy post với categories và authors
    const [allCategories, post] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.blogPost.findUnique({
        where: { id: postId },
        include: {
          categories: {
            include: { category: true },
          },
          authors: {
            include: { author: true },
          },
        },
      }),
    ]);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const selectedCategoryIds = post.categories.map((pc) => pc.categoryId);
    const selectedAuthorIds = post.authors.map((pa) => pa.authorId);

    return NextResponse.json({
      allCategories,
      selectedIds: selectedCategoryIds,
      selectedAuthorIds, // ✅ Trả về authorIds
    });
  } catch (err: any) {
    console.error("Error fetching post data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: cập nhật toàn bộ categories + authors cho post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);
    const { categoryIds, authorIds } = await req.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: "categoryIds[] required" },
        { status: 400 }
      );
    }

    // ✅ Validate authorIds nếu có
    if (authorIds && !Array.isArray(authorIds)) {
      return NextResponse.json(
        { error: "authorIds must be an array" },
        { status: 400 }
      );
    }

    // ✅ Dùng transaction để update cả categories và authors
    await prisma.$transaction(async (tx) => {
      // 1. Clear categories cũ
      await tx.postCategory.deleteMany({ where: { postId } });

      // 2. Insert categories mới
      if (categoryIds.length > 0) {
        await tx.postCategory.createMany({
          data: categoryIds.map((cid: number) => ({
            postId,
            categoryId: Number(cid),
          })),
        });
      }

      // 3. Clear authors cũ
      await tx.postAuthor.deleteMany({ where: { postId } });

      // 4. Insert authors mới
      if (authorIds && authorIds.length > 0) {
        await tx.postAuthor.createMany({
          data: authorIds.map((aid: number) => ({
            postId,
            authorId: Number(aid),
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating post data:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: xoá 1 category HOẶC 1 author khỏi post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id);
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const authorId = searchParams.get("authorId");

    // ✅ Xóa category
    if (categoryId) {
      const cid = Number(categoryId);
      if (!cid) {
        return NextResponse.json(
          { error: "Invalid categoryId" },
          { status: 400 }
        );
      }

      await prisma.postCategory.delete({
        where: { postId_categoryId: { postId, categoryId: cid } },
      });

      return NextResponse.json({
        success: true,
        message: "Category removed successfully",
      });
    }

    // ✅ Xóa author
    if (authorId) {
      const aid = Number(authorId);
      if (!aid) {
        return NextResponse.json(
          { error: "Invalid authorId" },
          { status: 400 }
        );
      }

      await prisma.postAuthor.delete({
        where: { postId_authorId: { postId, authorId: aid } },
      });

      return NextResponse.json({
        success: true,
        message: "Author removed successfully",
      });
    }

    return NextResponse.json(
      { error: "Either categoryId or authorId is required" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error deleting post relation:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}