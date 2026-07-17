"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/actions/modules";
import { useRefreshAction } from "@/hooks/use-refresh-action";

export function FileUploadForm({
  entityType,
  entityId,
  onSuccess,
}: {
  entityType: string;
  entityId?: string;
  onSuccess?: () => void;
}) {
  const { run, isPending } = useRefreshAction();
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) { toast.error("Select a file"); return; }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("linked_entity_type", entityType);
    if (entityId) formData.set("linked_entity_id", entityId);
    const result = await run(() => uploadDocument(formData));
    if (result?.error) { toast.error("Upload failed"); return; }
    toast.success("File uploaded");
    setFile(null);
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full">
        <Label className="text-xs text-muted-foreground">Upload file</Label>
        <Input type="file" className="mt-1" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <Button type="submit" disabled={isPending || !file} className="rounded-xl gap-2 shrink-0">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload
      </Button>
    </form>
  );
}
