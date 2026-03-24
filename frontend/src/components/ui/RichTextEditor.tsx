'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      // Повертаємо HTML-код, який потім збережемо в базу
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] border p-4 rounded-b-md',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col border rounded-md shadow-sm">
      {/* Панель інструментів */}
      <div className="flex gap-2 p-2 bg-gray-50 border-b rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm rounded ${editor.isActive('bold') ? 'bg-blue-200 font-bold' : 'hover:bg-gray-200'}`}
        >
          Жирний
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm rounded ${editor.isActive('italic') ? 'bg-blue-200 italic' : 'hover:bg-gray-200'}`}
        >
          Курсив
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-200 font-bold' : 'hover:bg-gray-200'}`}
        >
          H2
        </button>
      </div>

      {/* Сам редактор */}
      <EditorContent editor={editor} />
    </div>
  );
};