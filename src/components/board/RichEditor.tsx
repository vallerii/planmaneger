"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";

export default function RichEditor({
  initial,
  onChange,
}: {
  initial: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: true,
          autolink: true,
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Добавьте описание, заметки, чек-листы, ссылки…",
      }),
    ],
    content: initial || "",
    editorProps: { attributes: { class: "rich" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            task: editor.isActive("taskList"),
            link: editor.isActive("link"),
          }
        : null,
  });

  if (!editor) return <div className="rich text-[#aaa]">Загрузка…</div>;

  const tool = (on: boolean | undefined) =>
    `rounded-[7px] px-2 py-1.5 font-extrabold hover:bg-[#eceae4] ${on ? "bg-[#eceae4] text-ink" : "text-[#444]"}`;

  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    let url = window.prompt("Вставьте ссылку (https://…)", prev ?? "");
    if (url === null) return;
    url = url.trim();
    if (!url) {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    if (editor!.state.selection.empty && !prev) {
      editor!
        .chain()
        .focus()
        .insertContent(
          `<a href="${url.replace(/"/g, "%22")}">${url.replace(/</g, "&lt;")}</a> `,
        )
        .run();
    } else {
      editor!
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }

  return (
    <div className="overflow-hidden rounded-[13px] border border-line">
      <div
        className="flex flex-wrap items-center gap-[3px] border-b border-line bg-[#faf9f6] p-[7px]"
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          className={tool(active?.bold)}
          title="Жирный"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          className={tool(active?.italic)}
          title="Курсив"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>
        <button
          className={tool(active?.bullet)}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Список
        </button>
        <button
          className={tool(active?.ordered)}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Список
        </button>
        <button
          className={tool(active?.task)}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          ☑ Чек-лист
        </button>
        <button className={tool(active?.link)} onClick={setLink}>
          🔗 Ссылка
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
