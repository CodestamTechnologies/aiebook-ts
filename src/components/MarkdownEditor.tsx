'use client'

import { BoldItalicUnderlineToggles, MDXEditor, MDXEditorMethods, UndoRedo, headingsPlugin, listsPlugin, toolbarPlugin, codeBlockPlugin, thematicBreakPlugin, BlockTypeSelect, ListsToggle, codeMirrorPlugin } from "@mdxeditor/editor"
import { FC } from 'react'
import '@mdxeditor/editor/style.css'

interface EditorProps {
    markdown: string
    editorRef?: React.MutableRefObject<MDXEditorMethods | null>
    dontShowTools?: boolean
    readOnly?: boolean
    setMarkdown?: (newMarkdown: string) => void
    className?: string
    contentEditableClassName?: string
}

/**
 * Extend this Component further with the necessary plugins or props you need.
 * proxying the ref is necessary. Next.js dynamically imported components don't support refs. 
*/
const MarkdownEditor: FC<EditorProps> = ({ markdown, editorRef, dontShowTools, readOnly, setMarkdown, className, contentEditableClassName }) => {

    const tools = [
        headingsPlugin(),
        listsPlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        thematicBreakPlugin(),
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS' } }),
    ]

    if (!dontShowTools) {
        tools.push(toolbarPlugin({
            toolbarContents: () => {
                return (
                    <>
                        {' '}
                        <BlockTypeSelect />
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <ListsToggle />
                    </>
                )
            }
        }))
    }

    return (
        <MDXEditor
            readOnly={readOnly}
            className={className + ''}
            contentEditableClassName={"prose  " + contentEditableClassName}
            autoFocus
            key={'asdfghjkl'}
            ref={editorRef}
            markdown={markdown.toString()}
            onChange={(markdown) => setMarkdown && setMarkdown(markdown)}
            plugins={tools}
        />
    )
}

export default MarkdownEditor
