import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = parseInt(searchParams.get("per_page") || "10")

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { wpCreatedAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { categories: { include: { category: true } } },
      }),
      prisma.blogPost.count(),
    ])

    return NextResponse.json({ posts, totalPages: Math.ceil(total / perPage) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
