// File: app/api/post/[id]/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ✅ Handle CORS preflight
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = Number(id)

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const post = await prisma.blogPost.findFirst({
      where: {
        id: postId,
        isPublishedOnNextjs: true
      },
      include: {
        images: true,
        categories: { 
          include: { 
            category: true 
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // ✅ Format response để trả về authors đúng cấu trúc
    const formattedPost = {
      ...post,
      authors: post.authors.map(pa => ({
        id: pa.author.id,
        name: pa.author.name
      })),
      categories: post.categories.map(pc => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug
      }))
    }

    // ✅ THÊM CORS HEADERS VÀO RESPONSE
    return NextResponse.json(
      { post: formattedPost },
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