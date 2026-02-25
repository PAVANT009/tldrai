"use client"

import { useRef, ChangeEvent, useState, Dispatch, SetStateAction, DragEvent } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { X } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useRouter } from 'next/navigation'
import {toast } from "sonner"
import {Spinner} from "@/components/ui/spinner";

interface InputGroupCustomProps{
  prompt: string
  setPrompt:Dispatch<SetStateAction<string>>
}

export function InputGroupCustom({prompt, setPrompt} : InputGroupCustomProps) {
  const [fileName,setFileName] = useState<string|null>(null)
  const [pdfText,setPdfText] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getApiErrorMessage = (errorData: unknown, fallback: string) => {
    if (!errorData || typeof errorData !== "object") return fallback
    const payload = errorData as {
      error?: unknown
      code?: unknown
      details?: unknown
    }

    const message = typeof payload.error === "string" ? payload.error : fallback
    const code = typeof payload.code === "string" ? ` [${payload.code}]` : ""
    const details =
      payload.details && typeof payload.details === "object"
        ? ` ${JSON.stringify(payload.details)}`
        : ""

    return `${message}${code}${details}`
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const processPdfFile = async (file: File | null | undefined) => {
    if (!file) return
    const isPdfFile =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

    if (!isPdfFile) {
      toast.warning("Please upload a PDF file")
      return
    }

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

    const parsedText = typeof data?.text === "string" ? data.text : ""
    if (!parsedText.trim()) {
      toast.warning("PDF parsed, but no extractable text was found")
      setPdfText(null)
      return
    }

    setPdfText(parsedText)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    await processPdfFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]
    await processPdfFile(file)
  }

  const handleSubmit = async () => {
    if(!pdfText) return toast.warning("You can only start by adding a PDF")
    if (!prompt.trim() || loading) return;
    setLoading(true);

    const createConversationResponse = await fetch("/api/conversations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });

    if (!createConversationResponse.ok) {
      const errorData = await createConversationResponse.json().catch(() => null);
      toast.error(getApiErrorMessage(errorData, "Failed to create conversation"));
      setLoading(false);
      return;
    }

    const createConversationData = await createConversationResponse.json();
    const conversationId = createConversationData.conversation?.id as string;

    if (!conversationId) {
      toast.error("Conversation id missing in create response");
      setLoading(false);
      return;
    }

    const messageResponse = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: prompt.trim(), role: "user", pdfText }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json().catch(() => null);
      toast.error(getApiErrorMessage(errorData, "Failed to send message"));
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
      {
        pdfText === null && (
          <div className={`w-[90%] h-24 flex border border-dashed my-3.5 rounded-2xl justify-center text-muted-foreground items-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-primary"
          }`}
          onClick={handlePlusClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          >
        {isDragActive ? "Drop PDF here" : "Upload the file (or drop PDF here)"}
      </div>
                )
              }
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
          {/* <button type="button" onClick={handlePlusClick} className='border border-border rounded-md p-0.5 bg-muted text-muted-foreground'>
            <Plus />
          </button> */}
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
            {
              !loading ? "Submit" : <Spinner/>
            }
            
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
