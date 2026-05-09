import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function MarkdownContent({ content }) {
  if (!content || typeof content !== 'string') return null

  try {
    const html = DOMPurify.sanitize(marked.parse(content))
    return (
      <div
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } catch (error) {
    console.error('Markdown parse error:', error)
    return <div className="text-sm text-red-600">内容解析失败</div>
  }
}
