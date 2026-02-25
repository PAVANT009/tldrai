"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
})

type ConversationRow = {
  id: string
  title: string
  category: string | null
  lastMessage: string
  updatedAt: string
  messages: number | null
}

type ApiConversation = {
  id: string
  title: string
  lastMessage: string
  updatedAt: string
  messageCount?: number
  category?: { id: string; name: string } | null
}

interface ConversationTablesProps {
    activeCategory: string
}

export default function ConversationTables({activeCategory}: ConversationTablesProps) {
  const [search, setSearch] = useState("")
  const [sortDesc, setSortDesc] = useState(true)
  const [rows, setRows] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const res = await fetch("/api/conversations", { cache: "no-store" })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setLoadError(
          typeof data?.error === "string"
            ? data.error
            : "Failed to fetch conversations"
        )
        setRows([])
        setLoading(false)
        return
      }

      const conversations = Array.isArray(data?.conversations)
        ? (data.conversations as ApiConversation[])
        : []

      setRows(
        conversations.map((conversation) => ({
          id: conversation.id,
          title: conversation.title || "Untitled",
          category: conversation.category?.name ?? null,
          lastMessage: conversation.lastMessage || "",
          updatedAt: conversation.updatedAt,
          messages:
            typeof conversation.messageCount === "number"
              ? conversation.messageCount
              : 0,
        }))
      )
    } catch {
      setLoadError("Failed to fetch conversations")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
    const refresh = () => loadConversations()
    window.addEventListener("conversations:refresh", refresh)
    return () => window.removeEventListener("conversations:refresh", refresh)
  }, [loadConversations])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    const list = rows.filter((row) => {
      const matchesCategory =
        activeCategory === "All" || row.category === activeCategory
      const matchesQuery =
        query.length === 0 ||
        row.title.toLowerCase().includes(query) ||
        row.lastMessage.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })

    return list.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime()
      const bTime = new Date(b.updatedAt).getTime()
      return sortDesc ? bTime - aTime : aTime - bTime
    })
  }, [activeCategory, rows, search, sortDesc])

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="max-w-xs"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDesc((prev) => !prev)}
        >
          <ArrowUpDown />
          Updated {sortDesc ? "Newest" : "Oldest"}
        </Button>
      </div>

      {/* <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="xs"
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div> */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conversation</TableHead>
              {/* <TableHead>Category</TableHead> */}
              <TableHead>Last Message</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  Loading conversations...
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-destructive">
                  {loadError}
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                  No conversations found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-48 truncate font-medium">{row.title}</TableCell>
                  {/* <TableCell>
                    <span className="inline-flex rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {row.category}
                    </span>
                  </TableCell> */}
                  <TableCell className="max-w-64 truncate text-muted-foreground">
                    {row.lastMessage}
                  </TableCell>
                  <TableCell>{row.messages ?? "-"}</TableCell>
                  <TableCell>
                    {dateFormatter.format(new Date(row.updatedAt))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="xs" asChild>
                      <a href={`/chat/${row.id}`}>
                        <ExternalLink />
                        Open
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
