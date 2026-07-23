"use server";

import {
  validateAdminCredentials,
  createAdminToken,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  verifyAdminSession,
} from "./auth";
import { revalidatePath } from "next/cache";

export async function loginAdmin(data: { usernameInput: string; passwordInput: string }) {
  try {
    const isValid = await validateAdminCredentials(data.usernameInput, data.passwordInput);
    if (!isValid) {
      return { success: false, error: "Invalid admin username or password." };
    }

    const token = await createAdminToken(data.usernameInput.trim());
    await setAdminSessionCookie(token);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Authentication failed. Please try again." };
  }
}

export async function logoutAdmin() {
  try {
    await clearAdminSessionCookie();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to log out." };
  }
}

export async function checkAdminSession() {
  const session = await verifyAdminSession();
  return { isAuthenticated: !!session, session };
}
