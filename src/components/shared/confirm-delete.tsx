"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteProps {
  onDelete: () => void;
  label?: string;
}

export function ConfirmDelete({ onDelete, label = "Delete" }: ConfirmDeleteProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      title={label}
      onClick={() => {
        if (confirm(`Are you sure you want to ${label.toLowerCase()}?`)) {
          onDelete();
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
