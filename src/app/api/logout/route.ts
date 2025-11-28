import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout Successfully" }, { status: 200 });

  // Danh sách pattern các cookie liên quan đến session
  const cookieNames = [
    "__session",
    "__client_uat",
    "__refresh",
    "__clerk_db_jwt",
    "token"
  ];

  // Xoá tất cả cookie (kể cả dạng có hậu tố _xxxxx)
  for (const name of cookieNames) {
    response.cookies.set(name, "", { expires: new Date(0), path: "/" });
    response.cookies.set(`${name}_yWaNUR1Z`, "", { expires: new Date(0), path: "/" });
  }

  return response;
}
