"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon, PanelRightIcon, SearchIcon } from "lucide-react";
import { DashboardCommand } from "@/modules/dashboard/ui/components/dashboard-command";
import { ModeToggle } from "@/components/toggle-btn";

export const PageNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <nav className="h-14 border-b bg-background px-4 dark:border-none">
        <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={toggleSidebar}>
              {state === "collapsed" || isMobile ? (
                <PanelLeftIcon className="size-4" />
              ) : (
                <PanelRightIcon className="size-4" />
              )}
            </Button>
            <div className="text-3xl font-semibold leading-none">
              TL<span className="text-3xl text-primary">;</span>DR
            </div>
          </div>

          <Button
            className="h-9 w-full max-w-[280px] justify-start text-muted-foreground hover:text-muted-foreground"
            variant="outline"
            size="sm"
            onClick={() => setCommandOpen((open) => !open)}
          >
            <SearchIcon className="size-4" />
            Search
            <kbd className="ml-auto inline-flex h-5 items-center rounded border bg-secondary px-1.5 font-mono text-[10px]">
              <span>&#8984;</span>k
            </kbd>
          </Button>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </nav>

      {/* Previous navbar version kept for reference
      <nav className="h-14 flex px-4 items-center py-3  bg-background/10 w-full justify-between border-b dark:border-none">
        <div className="flex flex-row items-center justify-center gap-6">
          <div className="text-3xl">
            TL<span className="text-primary font-bold text-4xl">;</span>DR
          </div>
          <Button className="size-9" variant="outline" onClick={toggleSidebar}>
            {state === "collapsed" || isMobile ? (
              <PanelLeftIcon className="size-4" />
            ) : (
              <PanelRightIcon className="size-4" />
            )}
          </Button>
        </div>

        <Button
          className="h-9 w-[240px] justify-start font-normal text-muted-foreground hover:text-muted-foreground"
          variant={"outline"}
          size={"sm"}
          onClick={() => setCommandOpen((open) => !open)}
        >
          <SearchIcon />
          Search
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-secondary px-1.5 font-mono text-[10px] font-medium text-secondary-foreground">
            <span>&#8984;</span>k
          </kbd>
        </Button>

        <div className="flex flex-row justify-end gap-x-2">
          <ModeToggle />
        </div>
      </nav>
      */}

      {/* Legacy starter reference
      <header className="h-14 w-full border-b flex items-center gap-4 px-4">
        <h1 className="font-semibold">My App</h1>
      </header>
      */}

    </>
  );
};
