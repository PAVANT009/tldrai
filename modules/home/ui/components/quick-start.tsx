"use client";

import { useMemo, useState } from "react";
import { Folder } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { HomeCategory, HomeConversation } from "@/modules/home/ui/components/home-view";

const PAGE_SIZE = 8;

type QuickStartProps = {
  categories: HomeCategory[];
  conversations: HomeConversation[];
};

export default function QuickStart({ categories, conversations }: QuickStartProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleCategories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, currentPage]);

  const chatCountByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();

    for (const conversation of conversations) {
      if (!conversation.categoryId) continue;
      counts.set(conversation.categoryId, (counts.get(conversation.categoryId) ?? 0) + 1);
    }

    return counts;
  }, [conversations]);

  return (
    <section className="w-full rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="rounded-md bg-secondary px-2.5 py-1 text-base font-semibold tracking-tight text-secondary-foreground md:text-lg">
          Categories
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          Quick Start
        </span>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="group flex min-h-28 w-full flex-col justify-between rounded-lg border border-border bg-muted/50 p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Folder className="h-5 w-5" />
                </div>

                <div>
                  <p className="truncate text-sm font-medium text-card-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {chatCountByCategoryId.get(category.id) ?? 0} chats
                  </p>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((prev) => Math.max(1, Math.min(totalPages, prev - 1)));
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNo) => (
                  <PaginationItem key={pageNo}>
                    <PaginationLink
                      href="#"
                      isActive={pageNo === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNo);
                      }}
                    >
                      {pageNo}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((prev) => Math.min(totalPages, prev + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </section>
  );
}
