import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Helper generate slug
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD") // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ categories })
  } catch (err: any) {
    console.error("GET /api/categories error:", err)
    return NextResponse.json({ categories: [] })
  }
}

// POST create new category
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name } = body

    if (!name) throw new Error("Name is required")

    const slug = slugify(name)

    const newCategory = await prisma.category.create({
      data: { name, slug },
    })

    return NextResponse.json({ success: true, category: newCategory })
  } catch (err: any) {
    console.error("POST /api/categories error:", err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}