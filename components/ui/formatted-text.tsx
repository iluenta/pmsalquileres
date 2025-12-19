"use client"

import ReactMarkdown from "react-markdown"

interface FormattedTextProps {
    text: string | null | undefined
    className?: string
}

export function FormattedText({ text, className = "" }: FormattedTextProps) {
    if (!text) return null

    const colorMap: Record<string, string> = {
        azul: "#2563eb",
        rojo: "#dc2626",
        verde: "#16a34a",
        naranja: "#ea580c",
        amarillo: "#ca8a04",
        gris: "#4b5563",
    }

    // Dividir el texto en partes de color y texto normal (usando [\s\S] para incluir saltos de línea)
    const parts = text.split(/(\[color:\w+\][\s\S]*?\[\/color\])/g)

    return (
        <div className={`prose-sm max-w-none ${className}`}>
            {parts.map((part, index) => {
                if (!part) return null

                const colorMatch = part.match(/\[color:(\w+)\]([\s\S]*?)\[\/color\]/)
                if (colorMatch) {
                    const colorName = colorMatch[1].toLowerCase()
                    const content = colorMatch[2]
                    const color = colorMap[colorName] || colorName
                    return (
                        <span key={index} style={{ color }}>
                            <ReactMarkdown components={{ p: ({ children }) => <>{children}</> }}>
                                {content}
                            </ReactMarkdown>
                        </span>
                    )
                }

                return (
                    <ReactMarkdown
                        key={index}
                        components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed inline-block">{children}</p>
                        }}
                    >
                        {part}
                    </ReactMarkdown>
                )
            })}
        </div>
    )
}
