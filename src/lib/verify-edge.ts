import { jwtVerify } from 'jose';


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
