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
          <div className="flex flex-col h-screen w-full">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main className="flex-1 p-4 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
