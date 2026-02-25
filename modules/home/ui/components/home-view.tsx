"use client";

import { useEffect, useState } from "react";
import HomeRecent from "@/modules/home/ui/components/home-recent";
import QuickStart from "@/modules/home/ui/components/quick-start";

export type HomeCategory = {
  id: string;
  name: string;
  updatedAt: string;
};

export type HomeConversation = {
  id: string;
  title: string;
  lastMessage: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  updatedAt: string;
};

export default function HomeView() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [conversations, setConversations] = useState<HomeConversation[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const [categoriesRes, conversationsRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/conversations", { cache: "no-store" }),
        ]);

        if (!isMounted) return;

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(Array.isArray(categoriesData?.categories) ? categoriesData.categories : []);
        } else {
          setCategories([]);
        }

        if (conversationsRes.ok) {
          const conversationsData = await conversationsRes.json();
          setConversations(
            Array.isArray(conversationsData?.conversations) ? conversationsData.conversations : []
          );
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error("Failed to load home data:", error);
        if (isMounted) {
          setCategories([]);
          setConversations([]);
        }
      }
    }

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4 p-4 md:p-6">
      <QuickStart categories={categories} conversations={conversations} />
      <HomeRecent conversations={conversations} />
    </div>
  );
}
