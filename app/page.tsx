import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/server-auth";

export default async function Home() {
  // const userId = await getCurrentUserId();
  // console.log(userId)
  // redirect(userId ? "/chat" : "/signin");
  redirect("/signin");
}
