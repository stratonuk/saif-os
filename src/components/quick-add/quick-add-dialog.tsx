"use client";

import { useState } from "react";
import {
  CheckSquare,
  Bell,
  Wallet,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const QUICK_ACTIONS = [
  { href: "/tasks?new=1", label: "New Task", icon: CheckSquare },
  { href: "/reminders?new=1", label: "New Reminder", icon: Bell },
  { href: "/money?new=1", label: "Transaction", icon: Wallet },
  { href: "/ideas?new=1", label: "Capture Idea", icon: Lightbulb },
  { href: "/goals?new=1", label: "New Goal", icon: Target },
];

export function QuickAddDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                variant="outline"
                className="h-12 justify-start rounded-xl"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href={action.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
