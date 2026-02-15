"use client"

import React, { Dispatch, SetStateAction, useMemo, useState } from "react"
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

type ConversationRow = {
  id: string
  title: string
  category: string
  lastMessage: string
  updatedAt: string
  messages: number
}

const rows: ConversationRow[] = [
  {
    id: "c1",
    title: "GST filing for freelancers",
    category: "Finance",
    lastMessage: "Summarize this in simple bullet points",
    updatedAt: "2026-02-15T17:45:00.000Z",
    messages: 14,
  },
  {
    id: "c2",
    title: "Next.js auth middleware errors",
    category: "Engineering",
    lastMessage: "Why does this redirect loop happen?",
    updatedAt: "2026-02-14T12:18:00.000Z",
    messages: 26,
  },
  {
    id: "c3",
    title: "Research paper on transformers",
    category: "Research",
    lastMessage: "Give me limitations and future work",
    updatedAt: "2026-02-13T07:30:00.000Z",
    messages: 9,
  },
  {
    id: "c4",
    title: "UX notes from client meeting",
    category: "Design",
    lastMessage: "Convert these notes into action items",
    updatedAt: "2026-02-11T21:10:00.000Z",
    messages: 7,
  },
]

interface ConversationTablesProps {
    activeCategory: string
    setActiveCategory: Dispatch<SetStateAction<string>>
    
}

export default function ConversationTables({activeCategory,setActiveCategory}: ConversationTablesProps) {
  const [search, setSearch] = useState("")
  const [sortDesc, setSortDesc] = useState(true)

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.category)))
    return ["All", ...unique]
  }, [])

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
  }, [activeCategory, search, sortDesc])

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
            {filteredRows.length === 0 ? (
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
                  <TableCell>{row.messages}</TableCell>
                  <TableCell>
                    {new Date(row.updatedAt).toLocaleDateString()}
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
