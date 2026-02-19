"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bolt, Home, Plus, User2 } from "lucide-react";
import MenuSVG from "@/components/MenuSVG";
import { ScrollArea } from "./ui/scroll-area";
import { authClient } from "@/lib/auth-client";
import { generateAvatar } from "@/lib/avatar";
import Image from "next/image";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
};

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadConversations = async () => {
    const res = await fetch("/api/conversations");
    if (!res.ok) return;

    const data = await res.json();
    setConversations(data.conversations ?? []);
  };

  useEffect(() => {
    const start = () => loadConversations();
    queueMicrotask(start);
    const refresh = () => loadConversations();
    window.addEventListener("conversations:refresh", refresh);
    return () => window.removeEventListener("conversations:refresh", refresh);
  }, [pathname]);

  const createdSvg = generateAvatar(session?.user?.name ?? session?.user?.email ?? "User")
  // const createNewChat = async () => {
  //   if (creating) return;
  //   setCreating(true);

  //   const res = await fetch("/api/conversations", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ title: "New Chat" }),
  //   });

  //   if (!res.ok) {
  //     setCreating(false);
  //     return;
  //   }

  //   const data = await res.json();
  //   const conversationId = data.conversation?.id as string;
  //   await loadConversations();
  //   window.dispatchEvent(new Event("conversations:refresh"));
  //   setCreating(false);
  //   if (conversationId) {
  //     router.push(`/chat/${conversationId}`);
  //   }
  // };

  return (
    <Sidebar className="dark:border-none">
      <SidebarContent className="ml-1.5 overflow-hidden">
        <SidebarGroup>
          <div className="my-2.5 h-9 w-[70%] rounded-lg bg-primary px-3 py-1">
            <button
              className="flex h-full w-full items-center justify-center gap-2 text-sm font-medium"
              // onClick={createNewChat}
              onClick={() => router.push("/chat")}
            >
              <Plus className="h-4 w-4 rounded-full bg-primary-foreground p-0.5" size={28} />
              <span className="text-primary-foreground">New Chat</span>
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sidebar-foreground">
                  <Link href="/home">
                    <Home /> Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-sidebar-foreground">
                  <Link href="/categories">
                    <MenuSVG /> Categories
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground">
                  <Bolt /> Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="min-h-0 flex-1">
          <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>

          <SidebarGroupContent className="min-h-0">
            {conversations.length === 0 ? (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="bg-sidebar-accent/20 text-xs text-muted-foreground">
                    No chats yet
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : (
              <ScrollArea className="h-full">
                <SidebarMenu>
                  {/* TODO:  Recent chats title should come from ai nor from user text[0]  */}
                  {conversations.map((chat) => {
                    const isActive = pathname === `/chat/${chat.id}`;
                    return (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          asChild
                          className={isActive ? "bg-sidebar-accent/90" : "bg-sidebar-accent/20"}
                        >
                          <Link href={`/chat/${chat.id}`}>
                            {isActive && <span className="h-6 w-2 rounded-sm bg-primary" />}
                            <span className="truncate">{chat.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </ScrollArea>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mb-6">
        <SidebarMenu className="flex flex-row">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Image src={createdSvg} height={34} width={34} alt="avatar" className="rounded-md"/>
              {session?.user?.name ?? session?.user?.email ?? "User"}
              {/* {createdSvg} */}
              {/* <User2 /> {session?.user?.name ?? session?.user?.email ?? "User"} */}
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* <SidebarMenuItem>
            <ModeToggle />
          </SidebarMenuItem> */}

          <SidebarMenuItem>
            <SidebarMenuButton
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                await authClient.signOut();
                router.replace("/signin");
                router.refresh();
              }}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
