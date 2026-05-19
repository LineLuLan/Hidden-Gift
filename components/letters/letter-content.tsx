"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface LetterContentProps {
  body: unknown;
}

/**
 * Read-only Tiptap renderer. Falls back to plain whitespace-text if body is
 * the legacy {type:"text",content:string} shape.
 */
export function LetterContent({ body }: LetterContentProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: normalizeDoc(body),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none",
      },
    },
  });

  return <EditorContent editor={editor} />;
}

function normalizeDoc(input: unknown): object {
  const EMPTY = { type: "doc", content: [{ type: "paragraph" }] };
  if (!input || typeof input !== "object") return EMPTY;
  const obj = input as { type?: string; content?: unknown };
  if (obj.type === "doc") return input as object;
  if (obj.type === "text" && typeof obj.content === "string") {
    return {
      type: "doc",
      content: obj.content
        .split("\n")
        .map((line) =>
          line.trim().length === 0
            ? { type: "paragraph" }
            : { type: "paragraph", content: [{ type: "text", text: line }] },
        ),
    };
  }
  return EMPTY;
}
