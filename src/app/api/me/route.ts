import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Giải mã token, ép kiểu an toàn
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      sub: number;
      email: string;
      role: string;
      fullName?: string;
    };

    if (!decoded || typeof decoded !== "object") {
      throw new Error("Invalid token payload");
    }

    // ✅ Trả thông tin người dùng
    return NextResponse.json({
      id: decoded.sub,
      fullName: decoded.fullName || "User",
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error("❌ Error in /api/me:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
