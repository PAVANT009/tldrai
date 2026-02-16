"use client"

import React, { Dispatch, SetStateAction } from "react"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Layers2 } from "lucide-react"

interface UserCategories {
  name: string
  id: number
}

interface ItemsProps {
  items: UserCategories[]
  setItems: Dispatch<SetStateAction<UserCategories[]>>
  setActiveCategory: Dispatch<SetStateAction<string>>

}

function SortableItem({ id, name, setActiveCategory }: { id: number; name: string, setActiveCategory:Dispatch<SetStateAction<string>>  }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setActiveCategory(name)}
      className="mb-2 flex items-center justify-start border-b bg-card p-3 cursor-pointer"
    >

      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1"
        >
        <GripVertical className="size-4" />
      </button>
            <div className="flex items-center justify-center gap-2.5">
                <Layers2   className="text-foreground/30 size-4.5 stroke-2 border border-border/90 p-1 w-8 h-8 rounded-md dark:bg-background"/>
                <span>{name}</span>
            </div>
    </div>
  )
}

export default function DNDView({ items, setItems, setActiveCategory }: ItemsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id)
      const newIndex = current.findIndex((item) => item.id === over.id)

      if (oldIndex < 0 || newIndex < 0) {
        return current
      }

      return arrayMove(current, oldIndex, newIndex)
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem
            setActiveCategory={setActiveCategory}
            key={item.id}
            id={item.id}
            name={item.name}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
