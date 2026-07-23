import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "admin_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "muc-cs-result-super-secret-jwt-key-2026"
);

export async function createAdminToken(username: string) {
  return await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { username: string; role: string };
  } catch (error) {
    return null;
  }
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifyAdminToken(token);
}

export async function validateAdminCredentials(usernameInput: string, passwordInput: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (usernameInput.trim() !== expectedUsername.trim()) {
    return false;
  }

  // Check if expectedPassword is a bcrypt hash (starts with $2a$ or $2b$)
  if (expectedPassword.startsWith("$2a$") || expectedPassword.startsWith("$2b$")) {
    return await bcrypt.compare(passwordInput, expectedPassword);
  }

  // Fallback to plain text match
  return passwordInput === expectedPassword;
}
