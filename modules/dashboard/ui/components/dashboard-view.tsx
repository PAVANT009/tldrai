import { Bot, User2 } from 'lucide-react'
import DashboardNavbar from './dashboard-navbar'
export default function DashBoardPage() {
  return (
    <div className='bg-background rounded-l-2xl w-full h-full p-4'>
      <DashboardNavbar/>
      <div className='flex flex-col flex-1  w-full'>
        {/* User Input */}
        <div className='flex flex-row-reverse self-end'>
            <User2/>
            <span className='px-2 bg-accent/50 text-accent-foreground/90 font-light rounded-md'>*An Foid</span>
        </div>
        {/* Ai Output */}
        <div className='flex flex-row self-start'>
          <Bot/>
          <span>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iure porro debitis quasi adipisci quisquam repudiandae laboriosam atque odio suscipit asperiores ullam, eveniet tenetur!</span>
        </div>
      </div>
    </div>
  )
}
