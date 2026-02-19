import CategoryViewPage from '@/modules/category/ui/components/category-view-page'
import React from 'react'

export default function page() {
  return (
    <div className='bg-background h-[85svh]'>
      {/* TODO:  So: don’t fetch all conversations once for your case. Use lazy fetch + per-tab cache. */}
      <CategoryViewPage/>
    </div>
  )
}
