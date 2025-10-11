import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
}

export function signToken(userId: number, email?: string, role?: string) {
  const payload: TokenPayload = {
    sub: userId,
    email: email || "",
    role: role || "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
