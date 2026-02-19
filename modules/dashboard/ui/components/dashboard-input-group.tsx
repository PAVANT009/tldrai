"use client"

import { useRef, ChangeEvent, useState, Dispatch, SetStateAction } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Plus, X } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useRouter } from 'next/navigation'
import {toast } from "sonner"

interface InputGroupCustomProps{
  prompt: string
  setPrompt:Dispatch<SetStateAction<string>>
}

export function InputGroupCustom({prompt, setPrompt} : InputGroupCustomProps) {
  const [fileName,setFileName] = useState<string|null>(null)
  const [pdfText,setPdfText] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name);
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/pdf-parse", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data?.error || "Failed to parse PDF")
      setFileName(null)
      setPdfText(null)
      return
    }

    setPdfText(typeof data?.text === "string" ? data.text : null)
  }

  const handleSubmit = async () => {
    if(!pdfText) return toast.warning("You can only start by adding a PDF")
    if (!prompt.trim() || loading) return;
    setLoading(true);

    const createConversationResponse = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });

    if (!createConversationResponse.ok) {
      setLoading(false);
      return;
    }

    const createConversationData = await createConversationResponse.json();
    const conversationId = createConversationData.conversation?.id as string;

    if (!conversationId) {
      setLoading(false);
      return;
    }

    const messageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: prompt.trim(), role: "user", pdfText }),
    });

    if (!messageResponse.ok) {
      setLoading(false);
      return;
    }

    window.dispatchEvent(new Event("conversations:refresh"));
    router.push(`/chat/${conversationId}`);
    setLoading(false);

    setPrompt("");
  };
  
  const cancelFile = () => {
    setFileName(null);
    setPdfText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } 

  return (
    <div className="grid w-full gap-6">
      <InputGroup>
        <TextareaAutosize
          data-slot="input-group-control"
          className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
          placeholder="Ask anything about your PDF..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <button type="button" onClick={handlePlusClick} className='border border-border rounded-md p-0.5 bg-muted text-muted-foreground'>
            <Plus />
          </button>
          {
            fileName && (

              <div className='flex flex-row items-center justify-center bg-accent border border-border rounded-md h-5 px-1.5 gap-4'>
            {fileName}
              <button onClick={() => cancelFile()} className='hover:bg-destructive rounded-md'> 
                <X className='size-5'/>
              </button>
          </div>
            )
          }

          <InputGroupButton
            className="ml-auto"
            size="sm"
            variant="default"
            disabled={!prompt.trim() || loading}
            onClick={handleSubmit}
          >
            Submit
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept='application/pdf'
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  )
}
