import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const result = await authenticateUser(email, password);
    if (!result) {
      return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    });

    // ✅ FIX: Set cookie work cả HTTP và HTTPS
    res.cookies.set({
      name: "token",
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      // ⭐ THAY ĐỔI Ở ĐÂY
      secure: false,  // Tắt secure để work với HTTP
      // Hoặc dùng: secure: process.env.ENABLE_SECURE_COOKIE === "true",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days thay vì 15 phút
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}