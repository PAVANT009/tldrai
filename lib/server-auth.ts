import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    const authError = new Error("Authentication required") as Error & {
      code?: string;
      statusCode?: number;
    };
    authError.code = "AUTH_REQUIRED";
    authError.statusCode = 401;
    throw authError;
  }

  return userId;
}
