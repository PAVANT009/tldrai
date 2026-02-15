"use client"

import { useState } from "react"
import DNDView from "./dnd-view"
import { Pin, Plus, Tag } from "lucide-react"
import ConversationTables from "./converstaion-category"

interface UserCategories {
  name: string
  id: number
}

export default function CategoryViewPage() {
  const [items, setItems] = useState<UserCategories[]>([
    { id: 1, name: "Finance" },
    { id: 2, name: "Engineering" },
    { id: 3, name: "Research" },
    { id: 4, name: "Design" },
  ])

  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="flex flex-col py-7 min-w-sm h-full bg-card m-10 border border-border gap-3">
      <div className="flex flex-row justify-between items-center px-10">
        <div className="font-bold text-xl">
          {items.length} Categories
        </div>

        <button className="bg-primary text-primary-foreground flex flex-row px-2 py-1.5 rounded-md">
          <Plus />
          Add Category
        </button>
      </div>

      <div className="flex flex-row border-t border-border px-10 h-svh">
        <div className="flex flex-col min-w-[30%] border-r border-r-border  py-2 px-1 gap-2">
          <div className="flex flex-row w-full bg-accent items-center py-2 px-2 rounded-md gap-2">
            <div className="bg-background/60 h-7 w-7 flex justify-center items-center rounded-md">
              {/* <Tag className="size-3.5 bg-accent text-slate-800 dark:text-white  fill-[#1d293d] dark:fill-[#ffffff]"/> */}
              <Tag  className="text-foreground/50 size-3.5  fill-foreground/50 stroke-0"/>
            </div>
            <div className="text-foreground">
              All products
            </div>
          </div>
          <div className="flex flex-row w-full items-center py-2 px-2 rounded-md gap-2">
            <div className="bg-accent h-7 w-7 flex justify-center items-center rounded-md">
              {/* <Pin className="text-slate-800 dark:text-white  fill-[#1d293d] dark:fill-[#ffffff]" />  */}
              <Pin className="text-foreground/50 size-3.5  fill-foreground/50" />
              </div>
              Trending Products
            </div>

          <div className="border-t border-t-border">
            <DNDView items={items} setItems={setItems} setActiveCategory={setActiveCategory} />
          </div>
        </div>

        <div className="flex-1">
          <ConversationTables activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>
      </div>
    </div>
  )
}
