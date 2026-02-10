import "./globals.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Navbar } from "@/modules/dashboard/ui/navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex min-h-svh w-full flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
