"use client"

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

type CategoryOption = {
  id: string
  name: string
}

function isCategoryOption(value: unknown): value is CategoryOption {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    typeof (value as { id: unknown }).id === "string" &&
    typeof (value as { name: unknown }).name === "string"
  )
}

interface ComboboxBasicProps{
  value: string | null
  setValue: Dispatch<SetStateAction<string | null>>
  onCategoryChange?: (category: CategoryOption | null) => void
}

export function ComboboxBasic({value,setValue,onCategoryChange}: ComboboxBasicProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  useEffect(() => {
    let isMounted = true

    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" })
        const data = await res.json()

        if (!isMounted) return

        if (!res.ok) {
          setCategories([])
          return
        }

        const nextCategories = Array.isArray(data?.categories)
          ? data.categories.filter(
              (cat: unknown): cat is CategoryOption =>
                isCategoryOption(cat) && cat.name.trim().toLowerCase() !== "fav"
            )
          : []

        setCategories(nextCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        if (isMounted) {
          setCategories([])
        }
      }
    }

    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <Combobox
        items={categories.map((category) => category.id)}
        value={value}
        itemToStringLabel={(itemId) => categoryNameById.get(itemId) ?? itemId}
        onValueChange={(nextValue) => {
          setValue(nextValue)
          const selected = categories.find((category) => category.id === nextValue) || null
          onCategoryChange?.(selected)
        }}
      >
        <ComboboxInput  className={"bg-none"} placeholder="Select Category" />
        <ComboboxContent>
          <ComboboxEmpty>No categories found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => {
              return (
                <ComboboxItem key={item} value={item}>
                  {categoryNameById.get(item) ?? item}
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
