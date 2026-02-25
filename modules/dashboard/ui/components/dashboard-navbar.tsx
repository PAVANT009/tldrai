"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, PenLine, Star } from "lucide-react";
import { ComboboxBasic } from "@/modules/category/ui/components/combobox-category";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";


interface Props {
  title: string;
  category: string | null;
}

export default function DashboardNavbar({ title, category }: Props) {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const favCategoryId = "699d514d6d78ceb775e32ef5";
  const [value, setValue] = useState<string | null>(category);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFav = value === favCategoryId;

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      if (!conversationId) return;

      const res = await fetch(`/api/conversations/${conversationId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = await res.json();
      if (!isMounted) return;
      setValue(data?.conversation?.categoryId ?? null);
    };

    loadConversation();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  const handleSaveTitle = async () => {
    if (!conversationId) return;
    const nextTitle = inputRef.current?.value?.trim();
    if (!nextTitle) return;

    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nextTitle,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error || "Failed to update conversation");
      return;
    }
  };

  const handleCategoryChange = async (categoryId: string | null) => {
    if (!conversationId) return;

    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(data.error || "Failed to update category");
      return;
    }

    setValue(data?.conversation?.categoryId ?? categoryId);
    window.dispatchEvent(new Event("conversations:refresh"));
  };

  const handleFav = () => {
    if (isFav) {
      handleCategoryChange(null);
      return;
    }
    handleCategoryChange(favCategoryId);
  };

  return (
    <div className="flex h-14 flex-row justify-between">
      <div className="flex items-center gap-3">
        <MessagesSquare />
        <div className="flex gap-3.5">
          <input
            key={title}
            ref={inputRef}
            type="text"
            defaultValue={title}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className=" px-2 outline-none focus:border focus:border-border rounded-md"
          />
          <PenLine
            className="size-5 font-medium text-accent-foreground/80"
            onClick={handleSaveTitle}
          />
        </div>
      </div>
      <div className="flex gap-2.5">
        {
          (value == null || isFav )&& (
        <span className="h-fit rounded-md p-1 text-accent-foreground/70">
          <button
            onClick={handleFav}
            className="inline-flex size-8 items-center justify-center rounded-md bg-accent/20"
          >
            <Star
              className={cn(
                "size-4 transition",
                isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )}
            />
          </button>
        </span>
          )
        }
        {!isFav && (
          <span className="h-fit rounded-md p-1 text-accent-foreground/70">
            <div>
              <ComboboxBasic
                value={value}
                setValue={setValue}
                onCategoryChange={(category) =>
                  handleCategoryChange(category?.id ?? null)
                }
              />
            </div>
          </span>
        )}
      </div>
    </div>
  );
}
