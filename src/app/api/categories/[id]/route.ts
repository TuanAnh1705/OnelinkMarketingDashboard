import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

// PUT update category
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json()
    const { name } = body

    if (!name) throw new Error("Name is required")

    const slug = slugify(name)

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { name, slug },
    })

    return NextResponse.json({ success: true, category: updated })
  } catch (err: any) {
    console.error("PUT /api/categories/:id error:", err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// DELETE category
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.category.delete({
      where: { id: Number(id) },
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /api/categories/:id error:", err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}