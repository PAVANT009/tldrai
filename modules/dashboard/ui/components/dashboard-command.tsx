import { useRouter } from "next/navigation";
import { CommandGroup, CommandInput, CommandItem, CommandList, CommandResponsiveDialog } from "@/components/ui/command"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

import { CommandEmpty } from "cmdk";
interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

type ConversationCommandItem = {
  id: string;
  title: string;
  lastMessage: string;
};

function fuzzyMatch(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    ti = t.indexOf(q[qi], ti);
    if (ti === -1) return false;
    ti++;
  }
  return true;
}

export const DashboardCommand = ({ open, setOpen}: Props) => {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState<ConversationCommandItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
      if (!open) return;

      const loadConversations = async () => {
        setLoading(true);
        setLoadError(null);

        try {
          const res = await fetch("/api/conversations", { cache: "no-store" });
          const data = await res.json().catch(() => null);

          if (!res.ok) {
            setConversations([]);
            setLoadError(typeof data?.error === "string" ? data.error : "Failed to load conversations");
            return;
          }

          const list = Array.isArray(data?.conversations) ? data.conversations : [];
          setConversations(
            list.map((conversation: { id: string; title?: string; lastMessage?: string }) => ({
              id: conversation.id,
              title: conversation.title || "Untitled",
              lastMessage: conversation.lastMessage || "",
            }))
          );
        } catch {
          setConversations([]);
          setLoadError("Failed to load conversations");
        } finally {
          setLoading(false);
        }
      };

      loadConversations();
    }, [open]);

    const filteredConversations = useMemo(() => {
      const query = search.trim();
      if (!query) return conversations;
      return conversations.filter((conversation) =>
        fuzzyMatch(conversation.title, query) ||
        fuzzyMatch(conversation.lastMessage, query)
      );
    }, [conversations, search]);


    return (
        <CommandResponsiveDialog
            open={open} 
            onOpenChange={setOpen} 
            shouldFilter={false}
        >
            <CommandInput
                placeholder="Search conversations..."
                value={search}
                onValueChange={(value) => setSearch(value)}
            />
            <CommandList >
                <CommandGroup heading="Conversations">
                  {loading ? (
                    <CommandItem disabled>Loading conversations...</CommandItem>
                  ) : loadError ? (
                    <CommandItem disabled>{loadError}</CommandItem>
                  ) : filteredConversations.length === 0 ? (
                    <CommandEmpty>
                      <span className="text-muted-foreground text-sm">
                        No conversations found
                      </span>
                    </CommandEmpty>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <CommandItem
                        className="h-12"
                        key={conversation.id}
                        value={`${conversation.title} ${conversation.lastMessage}`}
                        onSelect={() => {
                          router.push(`/chat/${conversation.id}`);
                          setOpen(false);
                        }}
                      >
                        {conversation.title}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    )
}
