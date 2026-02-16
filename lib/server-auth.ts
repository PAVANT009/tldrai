import { headers } from "next/headers";

// Replace this function with your actual auth integration.
// For now, it accepts an `x-user-id` header and falls back to a demo id.
export async function getCurrentUserId() {
  const h = await headers();
  return h.get("x-user-id") || "demo-user";
}
