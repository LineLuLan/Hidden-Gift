"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrushCard } from "@/components/crush/crush-card";
import { CrushForm } from "@/components/crush/crush-form";
import { addDiaryEntry, deleteDiaryEntry } from "@/lib/crush/actions";
import type { Crush, DiaryEntry } from "@/lib/crush/queries";
import { formatRelative } from "@/lib/utils/format";

const MOOD_EMOJIS = ["💕", "🥰", "😭", "🥺", "😤", "🙂", "🤔", "😐"];

interface CrushHubProps {
  crush: Crush | null;
  diary: DiaryEntry[];
}

export function CrushHub({ crush, diary }: CrushHubProps) {
  const [editing, setEditing] = useState(crush === null);
  const [composeOpen, setComposeOpen] = useState(false);

  if (editing) {
    return (
      <CrushForm
        crush={crush}
        onSaved={() => setEditing(false)}
        onCancel={crush ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {crush ? <CrushCard crush={crush} onEdit={() => setEditing(true)} /> : null}

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Nhật ký</h2>
          <Button size="sm" onClick={() => setComposeOpen(!composeOpen)}>
            <Plus className="h-4 w-4" />
            {composeOpen ? "Đóng" : "Viết entry"}
          </Button>
        </header>

        {composeOpen ? <DiaryComposer onPosted={() => setComposeOpen(false)} /> : null}

        {diary.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Chưa có entry nào. Viết câu chuyện đầu tiên nha.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {diary.map((e) => (
              <DiaryItem key={e.id} entry={e} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DiaryComposer({ onPosted }: { onPosted: () => void }) {
  const [mood, setMood] = useState<string>("💕");
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    formData.set("mood", mood);
    startTransition(async () => {
      const r = await addDiaryEntry(null, formData);
      if (!r.ok) {
        toast.error(r.error ?? "Lỗi lưu");
        return;
      }
      toast.success("Đã lưu");
      setContent("");
      onPosted();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Hôm nay bạn cảm thấy?</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {MOOD_EMOJIS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                aria-pressed={mood === m}
                className={
                  "border-border hover:bg-accent h-9 w-9 rounded-md border text-lg transition-colors " +
                  (mood === m ? "border-primary bg-accent" : "")
                }
              >
                {m}
              </button>
            ))}
          </div>
          <Textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            required
            maxLength={2000}
            placeholder="Hôm nay người ấy mặc..."
          />
          <Input
            name="entryDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
          <Button type="submit" disabled={pending || content.trim().length === 0}>
            {pending ? "Đang lưu..." : "Lưu entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DiaryItem({ entry }: { entry: DiaryEntry }) {
  const [pending, startTransition] = useTransition();
  return (
    <li>
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <span className="text-2xl">{entry.mood ?? "💕"}</span>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">
              {entry.entry_date} · {formatRelative(entry.created_at)}
            </p>
            <p className="mt-0.5 text-sm whitespace-pre-wrap">{entry.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={pending}
            onClick={() => {
              if (!confirm("Xoá entry này?")) return;
              startTransition(async () => {
                const r = await deleteDiaryEntry(entry.id);
                if (!r.ok) toast.error(r.error ?? "Lỗi xoá");
                else toast.success("Đã xoá");
              });
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </li>
  );
}
