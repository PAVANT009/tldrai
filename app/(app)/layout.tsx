import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PageNavbar } from "@/modules/dashboard/ui/components/navbar";
import { getCurrentUserId } from "@/lib/server-auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full flex-col overflow-hidden">
        <PageNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-auto rounded-l-2xl bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

