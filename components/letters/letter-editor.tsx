"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface LetterEditorProps {
  /** Tiptap doc JSON. Falls back to empty doc if null. */
  defaultValue?: unknown;
  /** Hidden field name — value gets serialized JSON of editor state. */
  name: string;
  placeholder?: string;
  readOnly?: boolean;
}

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Tiptap editor for letter body. Outputs Tiptap doc JSON into a hidden
 * input so it ships with the surrounding form submission.
 *
 * Backward-compat: if defaultValue is the legacy {type:"text",content:string}
 * shape, we wrap the string in a doc on init.
 */
export function LetterEditor({
  defaultValue,
  name,
  placeholder = "Viết lời gửi tương lai...",
  readOnly = false,
}: LetterEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: normalizeDoc(defaultValue),
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-3 py-2",
          "focus:outline-none",
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = JSON.stringify(ed.getJSON());
      }
    },
    immediatelyRender: false,
  });

  // Sync initial hidden value on mount
  useEffect(() => {
    if (editor && hiddenRef.current) {
      hiddenRef.current.value = JSON.stringify(editor.getJSON());
    }
  }, [editor]);

  return (
    <div className="border-input rounded-md border">
      {!readOnly && editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={JSON.stringify(normalizeDoc(defaultValue))}
      />
    </div>
  );
}

function normalizeDoc(input: unknown): object {
  if (!input || typeof input !== "object") return EMPTY_DOC;
  const obj = input as { type?: string; content?: unknown };
  if (obj.type === "doc") return input as object;
  // Legacy plain-text wrapper
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
  return EMPTY_DOC;
}

function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;
  const btn = (active: boolean) => cn("h-8 w-8 p-0", active && "bg-accent text-accent-foreground");
  return (
    <div className="border-input bg-muted/30 flex flex-wrap items-center gap-0.5 border-b px-1 py-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bold"
        className={btn(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Italic"
        className={btn(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Bullet list"
        className={btn(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Numbered list"
        className={btn(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Blockquote"
        className={btn(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="bg-border mx-1 h-5 w-px" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
