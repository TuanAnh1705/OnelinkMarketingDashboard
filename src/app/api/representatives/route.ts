import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reps = await prisma.aboutUsRepresentative.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(reps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, position, imageUrl } = await req.json();
    
    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const rep = await prisma.aboutUsRepresentative.create({
      data: { name, position, imageUrl },
    });
    
    return NextResponse.json(rep);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}