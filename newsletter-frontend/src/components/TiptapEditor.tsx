import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapEditorProps {
    content: object;
    onChange: (content: object) => void;
}

export const TiptapEditor = ({
    content,
    onChange
}: TiptapEditorProps) => {

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],

        content: content,

        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="tiptap-editor">

            <div className="editor-toolbar">

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                >
                    Bold
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                >
                    Italic
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({
                        level: 2
                    }).run()}
                >
                    Heading
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    Bullet List
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    Numbered List
                </button>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    Quote
                </button>

            </div>

            <EditorContent editor={editor} />

        </div>
    );
};