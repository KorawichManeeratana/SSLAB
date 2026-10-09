'use client'
import dynamic from 'next/dynamic'
import { off } from 'process'

const MonacoEditor = dynamic(
    () => import('@monaco-editor/react'),
    { ssr: false, loading: () => <div>กำลังโหลดตัวแก้ไขโค้ด...</div> }
)

type CodeEditorProps = {
    value: string
    onChange: (value: string) => void
    language?: string
}

export function CodeEditor({ value, onChange, language = 'javascript' }: CodeEditorProps) {
    return (
        <MonacoEditor
            height="100%"
            defaultLanguage={language}
            theme="vs-dark"
            value={value}
            onChange={(v) => onChange(v ?? '')}
            onMount={(editor) => {
                setTimeout(() => editor.layout(), 0)
            }}
            options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                tabSize: 2,
                /* lineNumbers : "off", */
            }}
        />
    )
}