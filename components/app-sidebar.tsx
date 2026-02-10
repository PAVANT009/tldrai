import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronDown, Plus, User2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

// export function AppSidebar() {
//   return (
//     <Sidebar className="h-64 bg-amber-200  ">
//       <SidebarHeader className="bg-red-400">
//         <SidebarMenu className="">
//           <SidebarMenuItem>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <SidebarMenuButton>
//                   Select Workspace
//                   <ChevronDown className="ml-auto" />
//                 </SidebarMenuButton>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
//                 <DropdownMenuItem>
//                   <span>Acme Inc</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton>
//               <User2 /> Username
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   )
// }


export function AppSidebar() {
   const recentChats = [
    { id: 1, title: "Project ideas" },
    { id: 2, title: "React bugs" },
    { id: 3, title: "Job board app" },
  ]
return (
  <Sidebar>
    <SidebarContent>

      <SidebarGroup>
        <div className="flex items-center bg-primary gap-2 px-2 py-1">
          <button className="flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Home</SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton>Settings</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>

        <SidebarGroupContent>
          <SidebarMenu>
            {recentChats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton>{chat.title}</SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

    </SidebarContent>

    <SidebarFooter className="mb-6">
      <SidebarMenu className="flex flex-row">
        <SidebarMenuItem>
          <SidebarMenuButton>
            <User2 /> Pavan
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton>Logout</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
)
}