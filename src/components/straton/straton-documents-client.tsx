"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FileUploadForm } from "@/components/shared/file-upload-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Document } from "@/lib/types";

const ENTITY_LABELS: Record<string, string> = {
  straton_client: "Client",
  straton_project: "Project",
  straton_invoice: "Invoice",
};

export function StratonDocumentsClient({ documents }: { documents: Document[] }) {
  const [filter, setFilter] = useState<string>("all");

  const stratonDocs = useMemo(
    () =>
      documents
        .filter((d) => d.linked_entity_type?.startsWith("straton"))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [documents]
  );

  const entityTypes = useMemo(() => {
    const types = new Set(stratonDocs.map((d) => d.linked_entity_type).filter(Boolean) as string[]);
    return Array.from(types);
  }, [stratonDocs]);

  const filtered = useMemo(() => {
    if (filter === "all") return stratonDocs;
    return stratonDocs.filter((d) => d.linked_entity_type === filter);
  }, [stratonDocs, filter]);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Contracts, invoices, and files linked to Straton clients."
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <FileUploadForm entityType="straton_client" />
          <p className="text-xs text-muted-foreground mt-2">
            Upload general Straton documents. Link to a specific client from their detail page.
          </p>
        </CardContent>
      </Card>

      {entityTypes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => setFilter("all")}
          >
            All ({stratonDocs.length})
          </Button>
          {entityTypes.map((type) => {
            const count = stratonDocs.filter((d) => d.linked_entity_type === type).length;
            return (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
                onClick={() => setFilter(type)}
              >
                {ENTITY_LABELS[type] ?? type} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents"
          description="Upload contracts, proposals, and invoices for your Straton clients."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="transition-all hover:border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{doc.file_name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(doc.created_at)}
                      {doc.file_size > 0 && ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                    </p>
                    {doc.linked_entity_type && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {ENTITY_LABELS[doc.linked_entity_type] ?? doc.linked_entity_type}
                      </Badge>
                    )}
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {doc.file_url && (
                  <Button variant="outline" size="sm" className="rounded-lg mt-4 w-full" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      View file
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
