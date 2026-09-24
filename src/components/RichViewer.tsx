"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";

/** Только просмотр описания. HTML проходит через схему редактора — чужие теги/скрипты отбрасываются. */
export default function RichViewer({ html }: { html: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: true,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true, onReadOnlyChecked: () => false }),
    ],
    content: html || "",
    editorProps: { attributes: { class: "rich !min-h-0 !p-0" } },
  });
  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
