"use client"

import { useRef, ChangeEvent, useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Plus } from "lucide-react"
import TextareaAutosize from "react-textarea-autosize"
import { useRouter } from 'next/navigation'

export function InputGroupCustom() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
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

    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: prompt.trim(), role: "user" }),
    });

    window.dispatchEvent(new Event("conversations:refresh"));
    router.push(`/chat/${conversationId}`);
    setLoading(false);
    setPrompt("");
  };

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
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
    </div>
  )
}
