"use client"

import { useCallback, useEffect, useState } from "react"
import { Pin, Tag } from "lucide-react"
import ConversationTables from "./converstaion-category"
import dynamic from "next/dynamic"
import { AddCategoryDialog } from "./modal-category"
import { cn } from "@/lib/utils"

const DNDView = dynamic(() => import("./dnd-view"), { ssr: false })


interface Categories {
    id: string,
    name: string,
}

export default function CategoryViewPage() {
  const [categories, setCategories] = useState<Categories[]>([]);

const loadCategories = useCallback(async () => {
  const res = await fetch("/api/categories");
  const data = await res.json();
  setCategories(
    Array.isArray(data?.categories)
      ? data.categories.map((cat: { id: string; name: string }) => ({
          id: cat.id,
          name: cat.name,
        }))
      : []
  );
}, []);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadCategories();
}, [loadCategories]);


  // const addCategory = async() => {
  //   const res = await fetch("api/categories", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       name: "School"
  //     })
  //   })
  //   const data = await res.json()
  //   console.log(data)
  //   if(!res.ok) {
  //     console.log("error")
  //   }
  // }

  const [activeCategory, setActiveCategory] = useState("All")
  const nonFavoriteCategoryCount = categories.filter(
    (category) => category.name.toLowerCase() !== "fav"
  ).length

  return (
    <div className="flex flex-col py-7 min-w-sm h-full bg-card m-10 border border-border gap-3 rounded-md">
      <div className="flex flex-row justify-between items-center px-10">
        <div className="font-bold text-xl bg-secondary text-secondary-foreground px-1 py-0.5 rounded-md">
          {nonFavoriteCategoryCount} Categories
        </div>

        {/* <button className="bg-primary text-primary-foreground flex flex-row px-2 py-1.5 rounded-md" onClick={() => addCategory()}>
          <Plus />
          Add Category
        </button> */}
        <AddCategoryDialog loadCategories={loadCategories}/>
      </div>

      <div className="flex flex-row border-t border-border px-10 h-svh">
        <div className="flex flex-col min-w-[30%] border-r border-r-border  py-2 px-1 gap-2">
          <div className={cn( "flex flex-row w-full items-center py-2 px-2 rounded-md gap-2 cursor-pointer", activeCategory === "All" ? "bg-accent" : "bg-none" )} onClick={() => setActiveCategory("All")} >
            <div className="bg-background/60 h-7 w-7 flex justify-center items-center rounded-md">
              {/* <Tag className="size-3.5 bg-accent text-slate-800 dark:text-white  fill-[#1d293d] dark:fill-[#ffffff]"/> */}
              <Tag  className="text-foreground/50 size-3.5  fill-foreground/50 stroke-0"/>
            </div>
            <div className="text-foreground">
              All products
            </div>
          </div>
          <div className={cn("flex flex-row w-full items-center py-2 px-2 rounded-md gap-2 cursor-pointer" , activeCategory === "fav" ? "bg-accent" : "bg-none")} onClick={() => setActiveCategory("fav")}>
            <div className="bg-background/60 h-7 w-7 flex justify-center items-center rounded-md">
              {/* <Pin className="text-slate-800 dark:text-white  fill-[#1d293d] dark:fill-[#ffffff]" />  */}
              <Pin className="text-foreground/50 size-3.5  fill-foreground/50" />
            </div>
              Favorite
          </div>

          <div className="border-t border-t-border pt-1.5">
            <DNDView activeCategory={activeCategory} items={categories} setItems={setCategories} setActiveCategory={setActiveCategory} />
          </div>
          {/* {!categories ||categories?.length  == 0 ?(
            <p>No categories available</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id}>{cat.name}</div>
            ))
          )} */}
        </div>

        <div className="flex-1">
          <ConversationTables activeCategory={activeCategory} />
        </div>
      </div>
    </div>
  )
}
