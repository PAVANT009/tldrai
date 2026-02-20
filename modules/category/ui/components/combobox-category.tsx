"use client"

import { Dispatch, SetStateAction, useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const

interface ComboboxBasicProps{
  value: string | null
  setValue: Dispatch<SetStateAction<string | null>>
}

export function ComboboxBasic({value,setValue}: ComboboxBasicProps) {
  // const [value, setValue] = useState<string | null>(null)

  return (
    <div>
      <Combobox
        items={frameworks}
        value={value}
        onValueChange={setValue}
      >
        <ComboboxInput  className={"bg-none"} placeholder="Select Category" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {/* {value && (
        <p className="mt-4">Selected: {value}</p>
      )} */}
    </div>
  )
}
