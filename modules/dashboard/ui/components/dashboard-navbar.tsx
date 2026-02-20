import React, { useState } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Ellipsis, MessagesSquare, PenLine, Star } from 'lucide-react'
import { Combobox } from '@/components/ui/combobox'
import { ComboboxBasic } from '@/modules/category/ui/components/combobox-category'
import { cn } from '@/lib/utils'
interface Props {
  title: string
}

export default function DashboardNavbar({ title }: Props) {
  const [fav, setFav] = useState(false);
  const [value, setValue] = useState<string | null>(null)


  return (
    <div className='flex h-14 flex-row justify-between'>
        <div className='flex gap-3 items-center '>
          {/* <SidebarTrigger className='bg-accent/80'/> */}
          <MessagesSquare/>
          <div className='flex gap-3.5'>
            <span className='text-md text-foreground  font-semibold'>{title}</span>
              <PenLine className='font-medium text-accent-foreground/80 size-5 '/>
          </div>
        </div>
        <div className='flex gap-2.5 '>
          {
            value === null && (
            <span className='p-1 h-fit text-accent-foreground/70 rounded-md'>
                        <button
                          onClick={() => setFav(!fav)}
                          className="inline-flex size-8 items-center justify-center rounded-md bg-accent/20"
                        >
                          <Star
                            className={cn(
                              "size-4 transition",
                              fav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )}
                          />
                        </button>
                      </span>
            )
          }
          {
            !fav && (
          <span className='p-1 h-fit text-accent-foreground/70 rounded-md'>
            <div >
              <ComboboxBasic value={value} setValue={setValue}/>
            </div>
                      {/* <Ellipsis size={18}/> */}
          </span>
            )
          }
        </div>
    </div>
  )
}
