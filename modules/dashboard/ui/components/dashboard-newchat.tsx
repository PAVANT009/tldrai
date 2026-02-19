"use client";

import React, { useState } from 'react'
import { InputGroupCustom } from './dashboard-input-group'

export default function DashboardNewChat() {
    const [prompt, setPrompt] = useState("");

  return (
    <div className='w-full h-full flex flex-col justify-center px-48 gap-5'>
        {/* Header */}
  <div className="text-4xl w-3/4 font-medium bg-linear-to-r from-black dark:from-white via-primary to-secondary bg-clip-text text-transparent dark:text-shadow-2xs">
    Welcome back! <br />
    <span>What do you want to ask your PDF today?</span>
  </div>
      {/* muted text */}
      <div className='text-muted-foreground/50 font-medium'>
        Start with a prompt below or write your own
      </div>
      {/* usual prompts */}
      <div className='flex flex-row gap-2.5'> 
            <div className='h-32 w-52 bg-muted border border-border rounded-md px-2 py-2.5 font-medium text-muted-foreground' onClick={() => setPrompt("Summarize this document in simple terms.")}>
                Summarize this document in simple terms.
            </div>
            <div className='h-32 w-52 bg-muted border border-border rounded-md px-2 py-2.5 font-medium text-muted-foreground' onClick={() => setPrompt("What are the key points or important highlights in this file?")}>
                What are the key points or important highlights in this file?
            </div>
            <div className='h-32 w-52 bg-muted border border-border rounded-md px-2 py-2.5 font-medium text-muted-foreground' onClick={() => setPrompt("Explain the main concepts in this document with examples.")}>
                Explain the main concepts in this document with examples.
            </div>
      </div>
      {/* input */}
      <InputGroupCustom prompt={prompt} setPrompt={setPrompt} />
    </div>
  )
}
