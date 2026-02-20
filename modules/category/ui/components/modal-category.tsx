import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"

interface addCategoryDialogProps{
    loadCategories:  () => Promise<void>
}

export function AddCategoryDialog({loadCategories} : addCategoryDialogProps) {
    const [newCat,SetNewCat] = useState("");
    const [open,setOpen] = useState(false)
    const addCategory = async () => {
        console.log(newCat)
        if (!newCat.trim()) return;

        const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCat }),
        });

        const data = await res.json();

        if (!res.ok) {
        console.error("Error:", data.error);
        } else {
        SetNewCat("");
        setOpen(false);
        await loadCategories();
        }
    };
  return (
    <Dialog open={open} onOpenChange={setOpen}> 
      <form>
        <DialogTrigger asChild>
            
        <Button 
            // variant={"outline"}
            className="bg-primary text-primary-foreground flex flex-row px-2 py-1.5 rounded-md" >
          <Plus />
          Add Category
        </Button>
          {/* <Button variant="outline">Open Dialog</Button> */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create a New Category</DialogTitle>
            <DialogDescription>
                Organize your conversations by grouping them into a category.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" value={newCat} onChange={(e) => SetNewCat(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={() => addCategory()}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
