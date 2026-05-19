"use client";

import { useState, useTransition } from "react";
import { Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatRelative } from "@/lib/utils/format";
import { deleteMemory } from "@/lib/memories/actions";

export interface MemoryGridItem {
  id: string;
  title: string | null;
  description: string | null;
  signedUrl: string;
  mediaType: "image" | "video";
  takenAt: string | null;
  createdAt: string;
  isOwner: boolean;
}

interface MemoryGridProps {
  items: MemoryGridItem[];
}

export function MemoryGrid({ items }: MemoryGridProps) {
  const [expanded, setExpanded] = useState<MemoryGridItem | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Xoá kỷ niệm này? Không hoàn tác được.")) return;
    startTransition(async () => {
      const r = await deleteMemory(id);
      if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
      else {
        toast.success("Đã xoá");
        setExpanded(null);
      }
    });
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setExpanded(m)}
              className="group bg-muted relative block aspect-square w-full overflow-hidden rounded-md"
            >
              {m.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.signedUrl}
                  alt={m.title ?? "Kỷ niệm"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <>
                  <video
                    src={m.signedUrl}
                    className="h-full w-full object-cover"
                    preload="metadata"
                  />
                  <span className="bg-background/80 absolute top-1 right-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
                    VIDEO
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>

      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="relative max-h-full w-full max-w-3xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="bg-card overflow-hidden">
              <CardContent className="space-y-3 p-3">
                <div className="flex justify-center">
                  {expanded.mediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={expanded.signedUrl}
                      alt={expanded.title ?? "Kỷ niệm"}
                      className="max-h-[70vh] w-auto rounded"
                    />
                  ) : (
                    <video
                      src={expanded.signedUrl}
                      controls
                      autoPlay
                      className="max-h-[70vh] w-auto rounded"
                    />
                  )}
                </div>
                <div className="space-y-1 px-2">
                  {expanded.title ? (
                    <h3 className={cn("text-lg font-semibold")}>{expanded.title}</h3>
                  ) : null}
                  {expanded.description ? (
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {expanded.description}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {expanded.takenAt
                      ? formatDate(expanded.takenAt)
                      : formatRelative(expanded.createdAt)}
                  </p>
                </div>
                <div className="flex justify-between gap-2 px-2 pb-1">
                  {expanded.isOwner ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleDelete(expanded.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xoá
                    </Button>
                  ) : (
                    <span />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(null)}>
                    Đóng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
