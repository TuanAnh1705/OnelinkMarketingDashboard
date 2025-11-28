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

    // Set HttpOnly cookie
    res.cookies.set({
      name: "token",
      value: result.token,
      // --- SỬA LỖI BẢO MẬT ---
      httpOnly: true, // Chuyển thành true để bảo mật. Ngăn JS phía client đọc cookie.
      // ---------------------
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // in seconds (15 minutes)
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
