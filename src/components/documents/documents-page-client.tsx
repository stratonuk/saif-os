"use client";

import { useMemo, useState } from "react";
import { FileText, Tag, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDelete } from "@/components/shared/confirm-delete";
import { FileUploadForm } from "@/components/shared/file-upload-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DOCUMENT_ENTITY_TYPES, SEARCH_ENTITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { deleteDocument } from "@/actions/modules";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { Document } from "@/lib/types";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ENTITY_LABELS: Record<string, string> = {
  ...SEARCH_ENTITY_LABELS,
  general: "General",
  client: "Client",
  project: "Project",
  invoice: "Invoice",
  vehicle: "Vehicle",
  subscription: "Subscription",
  note: "Note",
  straton_client: "Straton Client",
  straton_project: "Straton Project",
  straton_invoice: "Straton Invoice",
};

export function DocumentsPageClient({ documents }: { documents: Document[] }) {
  const { run } = useRefreshAction();
  const [filterType, setFilterType] = useState("all");

  const filtered = useMemo(() => {
    if (filterType === "all") return documents;
    return documents.filter((d) => d.linked_entity_type === filterType);
  }, [documents, filterType]);

  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      const type = doc.linked_entity_type ?? "general";
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return counts;
  }, [documents]);

  const uploadEntityType = filterType === "all" ? "general" : filterType;

  return (
    <>
      <PageHeader
        title="Documents"
        description="Store contracts, invoices, receipts, and files linked to your records."
      />

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-5">
          <FileUploadForm entityType={uploadEntityType} />
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
          onClick={() => setFilterType("all")}
        >
          All ({documents.length})
        </Button>
        {DOCUMENT_ENTITY_TYPES.map((type) => {
          const count = entityCounts[type] ?? 0;
          if (count === 0 && filterType !== type) return null;
          return (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setFilterType(type)}
            >
              {ENTITY_LABELS[type] ?? type}
              {count > 0 && ` (${count})`}
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload files to keep contracts, invoices, and receipts organised and easy to find."
        />
      ) : (
        <div className="space-y-2">
          {filtered
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((doc) => (
              <Card key={doc.id} className="transition-all active:scale-[0.98] touch-manipulation">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium truncate">{doc.file_name}</h3>
                        {doc.linked_entity_type && (
                          <Badge variant="outline" className="border-0 bg-muted text-xs shrink-0">
                            {ENTITY_LABELS[doc.linked_entity_type] ?? doc.linked_entity_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {doc.file_type && <span className="truncate max-w-[120px]">{doc.file_type}</span>}
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-0 bg-primary/5 text-primary text-[10px] gap-0.5">
                              <Tag className="h-2.5 w-2.5" /> {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    {doc.file_url && (
                      <Button variant="outline" size="sm" className="rounded-lg" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open
                        </a>
                      </Button>
                    )}
                    <ConfirmDelete
                      label="Delete document"
                      onDelete={async () => {
                        await run(() => deleteDocument(doc.id));
                        toast.success("Document deleted");
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </>
  );
}
