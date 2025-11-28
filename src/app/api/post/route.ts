// File: app/api/post/route.ts

import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function createExcerpt(html: string, maxLength: number = 150) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// ✅ Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // ✅ LẤY CÁC THAM SỐ TỪ QUERY
    const categoryId = searchParams.get("categoryId")
    const category = searchParams.get("category") // Từ ExpertSection
    const perPage = parseInt(searchParams.get("per_page") || "10")
    const published = searchParams.get("published") === "true"

    const where: any = {}

    // ✅ XỬ LÝ FILTER PUBLISHED
    if (published) {
      where.isPublishedOnNextjs = true
    }

    // ✅ XỬ LÝ FILTER CATEGORY (hỗ trợ cả categoryId và category name)
    if (categoryId) {
      where.categories = { some: { categoryId: Number(categoryId) } }
    } else if (category && category !== "All") {
      where.categories = {
        some: {
          category: {
            name: category
          }
        }
      }
    }

    // ✅ FETCH VỚI SORTING ĐÚNG
    const postsData = await prisma.blogPost.findMany({
      where,
      take: perPage,
      // ✅ QUAN TRỌNG: Sắp xếp theo displayOrder trước, sau đó theo ngày
      orderBy: [
        { displayOrder: "asc" }, // Posts có displayOrder lên đầu
        { wpCreatedAt: "desc" },  // Posts không có displayOrder sắp xếp theo ngày
      ],
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        authors: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    // ✅ SORT THỦ CÔNG để đảm bảo displayOrder null ở cuối
    const sortedPosts = postsData.sort((a, b) => {
      // Posts có displayOrder lên đầu
      if (a.displayOrder !== null && b.displayOrder === null) return -1;
      if (a.displayOrder === null && b.displayOrder !== null) return 1;
      
      // Cả 2 đều có displayOrder -> sort theo số
      if (a.displayOrder !== null && b.displayOrder !== null) {
        return a.displayOrder - b.displayOrder;
      }
      
      // Cả 2 đều null -> sort theo ngày mới nhất
      const dateA = a.wpCreatedAt ? new Date(a.wpCreatedAt).getTime() : 0;
      const dateB = b.wpCreatedAt ? new Date(b.wpCreatedAt).getTime() : 0;
      return dateB - dateA;
    });

    // ✅ TRANSFORM DATA
    const posts = sortedPosts.map(post => ({
      id: post.id,
      wpId: post.wpId,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      wpStatus: post.wpStatus,
      isPublishedOnNextjs: post.isPublishedOnNextjs,
      displayOrder: post.displayOrder, // ✅ Thêm field này
      wpCreatedAt: post.wpCreatedAt,
      categories: post.categories.map(pc => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      authors: post.authors.map(pa => ({
        id: pa.author.id,
        name: pa.author.name
      })),
      excerpt: createExcerpt(post.contentHtml, 150)
    }));

    return NextResponse.json(
      { posts, total: posts.length },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (err: any) {
    console.error("Error fetching posts:", err)
    return NextResponse.json(
      { error: err.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}