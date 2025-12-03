// File: app/api/post/route.ts

import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function createExcerpt(html: string, maxLength: number = 150) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

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
    
    const categoryId = searchParams.get("categoryId")
    const category = searchParams.get("category")
    const perPage = parseInt(searchParams.get("per_page") || "10")
    const published = searchParams.get("published") === "true"

    const where: any = {}

    if (published) {
      where.isPublishedOnNextjs = true
    }

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

    // ✅ FETCH TẤT CẢ POSTS
    const postsData = await prisma.blogPost.findMany({
      where,
      orderBy: { wpCreatedAt: "desc" }, // Posts không order sắp theo ngày
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

    // ✅ TÁCH POSTS CÓ ORDER VÀ KHÔNG CÓ ORDER
    const postsWithOrder = postsData.filter((p: any) => p.displayOrder !== null)
    const postsWithoutOrder = postsData.filter((p: any) => p.displayOrder === null)

    // ✅ TẠO MẢNG KẾT QUẢ VỚI VỊ TRÍ TUYỆT ĐỐI
    const result: typeof postsData = []
    let withoutOrderIndex = 0

    for (let i = 1; i <= perPage; i++) {
      // Tìm post có displayOrder = i
      const orderedPost = postsWithOrder.find((p: any) => p.displayOrder === i)
      
      if (orderedPost) {
        // ✅ Có post với order = i → Đặt vào vị trí i
        result.push(orderedPost)
      } else {
        // ✅ Không có post với order = i → Lấy post không order tiếp theo
        if (withoutOrderIndex < postsWithoutOrder.length) {
          result.push(postsWithoutOrder[withoutOrderIndex])
          withoutOrderIndex++
        } else {
          // Hết posts không order → Kiểm tra xem có post order > perPage không
          const nextOrderedPost = postsWithOrder
            .filter((p: any) => !result.includes(p))
            .sort((a : any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))[0]
          
          if (nextOrderedPost) {
            result.push(nextOrderedPost)
          }
        }
      }
    }

    // ✅ TRANSFORM DATA
    const posts = result.filter(Boolean).map((post: any) => ({
      id: post.id,
      wpId: post.wpId,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      wpStatus: post.wpStatus,
      isPublishedOnNextjs: post.isPublishedOnNextjs,
      displayOrder: post.displayOrder,
      wpCreatedAt: post.wpCreatedAt,
      categories: post.categories.map((pc: any) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      authors: post.authors.map((pa:any) => ({
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