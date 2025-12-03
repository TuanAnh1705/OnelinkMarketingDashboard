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

    // ✅ SMART DETECTION - Work cho cả HTTP và HTTPS
    const protocol = req.headers.get("x-forwarded-proto") || 
                     (req.url.startsWith("https") ? "https" : "http");
    const isSecure = protocol === "https";
    
    // Debug log
    console.log('[Login] Protocol:', protocol);
    console.log('[Login] Secure cookie:', isSecure);
    console.log('[Login] Host:', req.headers.get("host"));

    res.cookies.set({
      name: "token",
      value: result.token,
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,  // ⭐ Tự động: HTTPS=true, HTTP=false
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}