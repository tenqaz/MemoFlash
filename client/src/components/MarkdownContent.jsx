import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownContent({ content }) {
  if (!content) return null

  const html = DOMPurify.sanitize(marked.parse(content))
  return (
    <div
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
