import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

if (!JWT_SECRET) {
  throw new Error("⚠️ Missing JWT_SECRET environment variable");
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName || "",
  };

  const token = jwt.sign(
    payload as object,
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES } as SignOptions
  );

  return { token, user };
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret);

    // ✅ ép kiểu đúng chuẩn: unknown → target type
    return decoded as unknown as {
      sub: number;
      email: string;
      role: string;
      fullName?: string;
      iat?: number;
      exp?: number;
    };
  } catch {
    return null;
  }
}
