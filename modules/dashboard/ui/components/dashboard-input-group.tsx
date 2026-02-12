"use client"

import { useRef, ChangeEvent } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Plus } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"

export function InputGroupCustom() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', files);
      const firstFile = files[0];
      console.log('First file name:', firstFile.name);
    }
  };

  return (
    <div className="grid w-full gap-6">
      <InputGroup>
        <TextareaAutosize
          data-slot="input-group-control"
          className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
          placeholder="Autoresize textarea..."
        />
        <InputGroupAddon align="block-end">
          <button type="button" onClick={handlePlusClick} className='border border-border rounded-md p-0.5 bg-muted text-muted-foreground'>
            <Plus />
          </button>
          <InputGroupButton className="ml-auto" size="sm" variant="default">
            Submit
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  )
}
