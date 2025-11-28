import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ Thêm retry logic
async function retryQuery<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.code === "P1001") {
      console.log(`⚠️ Retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryQuery(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function GET() {
  try {
    const reps = await retryQuery(() =>
      prisma.aboutUsRepresentative.findMany({
        orderBy: { uploadedAt: "desc" },
      })
    );
    return NextResponse.json(reps);
  } catch (err: any) {
    console.error("❌ Database Error:", err);
    return NextResponse.json(
      { error: "Database connection failed", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, position, imageUrl } = await req.json();

    if (!name || !imageUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const rep = await retryQuery(() =>
      prisma.aboutUsRepresentative.create({
        data: { name, position, imageUrl },
      })
    );

    return NextResponse.json(rep);
  } catch (err: any) {
    console.error("❌ Database Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}