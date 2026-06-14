'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

export const RichTextEditor = ({ content, onChange, disabled = false }: RichTextEditorProps) => {

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] p-6 bg-white prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-blockquote:my-2 prose-blockquote:py-1',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // ДОДАНО: Цей блок вирішує проблему зникнення тексту при завантаженні сторінки!
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      // Оновлюємо редактор ТІЛЬКИ якщо контент дійсно прийшов і відрізняється
      if (currentContent !== content && !(currentContent === '<p></p>' && content === '')) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  // РАННІЙ ВИХІД
  if (!editor) {
    return <div className="min-h-[400px] bg-gray-50 border border-gray-200 rounded-md animate-pulse"></div>;
  }

  const ToolbarButton = ({
                           onClick,
                           isActive,
                           children
                         }: {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500 transition-shadow ${disabled ? 'opacity-70' : ''}`}>

      {/* Панель інструментів */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          Жирний
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          Курсив
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          Заголовок
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          Цитата
        </ToolbarButton>
      </div>

      {/* Зона редагування */}
      <div className="flex-grow cursor-text bg-white overflow-y-auto max-h-[60vh]" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};