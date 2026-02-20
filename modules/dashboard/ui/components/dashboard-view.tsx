"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, User2 } from "lucide-react";
import DashboardNavbar from "./dashboard-navbar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// type Message = {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   createdAt?: string;
// };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  loading?: boolean; // ✅ added
};


interface Props {
  conversationId: string;
}

export default function DashBoardPage({ conversationId }: Props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("New Chat");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMessages(data.messages ?? []);
      setTitle(data.conversation?.title || "New Chat");
      setLoading(false);
    };

    loadMessages();
  }, [conversationId]);

  // const handleSendMessage = async () => {
  //   if (!message.trim()) return;
  //   if (sending) return;

  //   const pendingMessage = message.trim();
  //   setSending(true);

  //   setMessage("");

  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "40px";
  //   }

  //   const optimistic: Message = {
  //     id: `optimistic-${Date.now()}`,
  //     role: "user",
  //     content: pendingMessage,
  //   };
  //   setMessages((prev) => [...prev, optimistic]);

  //   const res = await fetch(`/api/conversations/${conversationId}/messages`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ content: pendingMessage, role: "user" }),
  //   });

  //   if (res.ok) {
  //     const data = await res.json();
  //     setMessages((prev) => {
  //       const nextMessages = prev.map((msg) =>
  //         msg.id === optimistic.id ? data.message : msg
  //       );

  //       if (data.assistantMessage) {
  //         return [...nextMessages, data.assistantMessage];
  //       }

  //       return nextMessages;
  //     });
  //     if (data.conversation?.title) {
  //       setTitle(data.conversation.title);
  //     }
  //     window.dispatchEvent(new Event("conversations:refresh"));
  //   } else {
  //     setMessages((prev) => prev.filter((msg) => msg.id !== optimistic.id));
  //     setMessage(pendingMessage);
  //   }

  //   setSending(false);
  // };
const handleSendMessage = async () => {
  if (!message.trim()) return;
  if (sending) return;

  const pendingMessage = message.trim();
  setSending(true);
  setMessage("");

  if (textareaRef.current) {
    textareaRef.current.style.height = "40px";
  }

  // ✅ optimistic user message
  const optimistic: Message = {
    id: `optimistic-${Date.now()}`,
    role: "user",
    content: pendingMessage,
  };

  // ✅ fake assistant typing message
  const typingMessage: Message = {
    id: `typing-${Date.now()}`,
    role: "assistant",
    content: "",
    loading: true,
  };

  setMessages((prev) => [...prev, optimistic, typingMessage]);

  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: pendingMessage, role: "user" }),
  });

  if (res.ok) {
    const data = await res.json();

    setMessages((prev) => {
      // ❌ remove typing message
      const withoutTyping = prev.filter((msg) => !msg.loading);

      // ✅ replace optimistic user message
      const replacedUser = withoutTyping.map((msg) =>
        msg.id === optimistic.id ? data.message : msg
      );

      // ✅ add real assistant message
      if (data.assistantMessage) {
        return [...replacedUser, data.assistantMessage];
      }

      return replacedUser;
    });

    if (data.conversation?.title) {
      setTitle(data.conversation.title);
    }

    window.dispatchEvent(new Event("conversations:refresh"));
  } else {
    // remove optimistic + typing if failed
    setMessages((prev) =>
      prev.filter(
        (msg) => msg.id !== optimistic.id && !msg.loading
      )
    );
    setMessage(pendingMessage);
  }

  setSending(false);
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full w-full min-w-0 flex-col p-4">
      <DashboardNavbar title={title} />

      <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col gap-5 pb-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((chatMessage) => (
              <div
                key={chatMessage.id}
                className={
                  chatMessage.role === "user"
                    ? "flex w-full flex-row-reverse items-center gap-2 self-end"
                    : "flex flex-row items-center gap-2 self-start"
                }
              >
                {chatMessage.role === "user" ? <User2 /> : <Bot />}
                {/* <span className="flex min-h-9 min-w-[15%] max-w-[70%] items-center rounded-md bg-accent/50 px-2 py-2.5 text-accent-foreground/80 text-sm">
                  {chatMessage.content}
                </span> */}
                <span className="flex min-h-9 min-w-[15%] max-w-[70%] items-center rounded-md bg-accent/50    px-2  py-2.5 text-accent-foreground/80 text-sm">
                  {chatMessage.loading ? (
                    <div className="flex justify-center items-center gap-1 [&>span]:text-3xl [&>span]:text-accent-foreground h-3">
                      <span className="animate-bounce ">.</span>
                      <span className="animate-bounce [animation-delay:0.2s] ">.</span>
                      <span className="animate-bounce [animation-delay:0.4s]">.</span>
                    </div>
                  ) : (
                    chatMessage.content
                  )}
                </span>

              </div>
            ))
          )}
        </div>

        <div className="sticky bottom-0 mt-2 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="relative mx-auto w-full max-w-3xl">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message..."
              className="chat-scroll min-h-[40px] max-h-40 w-full resize-none overflow-y-auto pr-12"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                resizeTextarea(e.currentTarget);
              }}
              onKeyDown={handleKeyDown}
            />

            {message.trim() && (
              <Button
                type="button"
                size="icon"
                onClick={handleSendMessage}
                disabled={sending}
                className="absolute right-3 bottom-1 h-8 w-8 bg-primary text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
