import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { JSONContent } from '@tiptap/core';

interface ArticleContentProps {
    content: JSONContent;
}

export const ArticleContent = ({ content }: ArticleContentProps) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: {
            type: 'doc',
            content: content?.content ?? [],
        },
        editable: false,
        immediatelyRender: false,
    });

    if (!editor) return null;

    return (
        <div className="article-body">
            <EditorContent editor={editor} />
        </div>
    );
};