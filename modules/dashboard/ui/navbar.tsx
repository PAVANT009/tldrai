import { SidebarTrigger } from "@/components/ui/sidebar"

export function Navbar() {
  return (
    <header className="h-14 bg-red-50 w-[80%] border-b flex items-center px-4 gap-4">
      <SidebarTrigger />
      <h1 className="font-semibold">My App</h1>
    </header>
  )
}
