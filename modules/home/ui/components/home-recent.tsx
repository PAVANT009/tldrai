"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import type { HomeConversation } from "@/modules/home/ui/components/home-view";

const PAGE_SIZE = 6;

type HomeRecentProps = {
  conversations: HomeConversation[];
};

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function HomeRecent({ conversations }: HomeRecentProps) {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(conversations.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visibleConversations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return conversations.slice(start, start + PAGE_SIZE);
  }, [conversations, currentPage]);

  return (
    <section className="w-full rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm md:p-5">
      <div className="mb-4 flex items-center">
        <h2 className="rounded-md bg-secondary px-2.5 py-1 text-base font-semibold tracking-tight text-secondary-foreground md:text-lg">
          Recent
        </h2>
      </div>

      <Table>
        <TableCaption>A list of your most recent conversations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Category</TableHead>
            <TableHead>Chat Name</TableHead>
            <TableHead className="w-[130px]">Updated</TableHead>
            <TableHead className="text-right">Last Message</TableHead>
            <TableHead className="w-[100px] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleConversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No recent conversations yet.
              </TableCell>
            </TableRow>
          ) : (
            visibleConversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell className="font-medium">
                  <button
                    type="button"
                    onClick={() => router.push("/categories")}
                    className="rounded px-1 py-0.5 text-left text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {conversation.category?.name || "Uncategorized"}
                  </button>
                </TableCell>
                <TableCell className="max-w-[240px] truncate">{conversation.title}</TableCell>
                <TableCell>{formatDate(conversation.updatedAt)}</TableCell>
                <TableCell className="max-w-[260px] truncate text-right">
                  {conversation.lastMessage || "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/chat/${conversation.id}`)}
                    className="gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
    </section>
  );
}
