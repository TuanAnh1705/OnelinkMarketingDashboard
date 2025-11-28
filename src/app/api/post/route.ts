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
    const categoryId = searchParams.get("categoryId")

    const where: any = { isPublishedOnNextjs: true }

    if (categoryId) {
      where.categories = { some: { categoryId: Number(categoryId) } }
    }

    const postsData = await prisma.blogPost.findMany({
      where,
      orderBy: { wpCreatedAt: "desc" },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true }
            }
          }
        },
        // ✅ THÊM AUTHORS VÀO ĐÂY
        authors: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    const posts = postsData.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      coverImage: post.coverImage,
      wpCreatedAt: post.wpCreatedAt,
      categories: post.categories.map(pc => pc.category.name),
      // ✅ THÊM AUTHORS VÀO RESPONSE
      authors: post.authors.map(pa => ({
        id: pa.author.id,
        name: pa.author.name
      })),
      excerpt: createExcerpt(post.contentHtml, 150)
    }));

    return NextResponse.json(
      { posts },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (err: any) {
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