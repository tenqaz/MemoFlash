import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  breaks: true,
  gfm: true
})

export default function MarkdownContent({ content }) {
  if (!content || typeof content !== 'string') return null

  try {
    const html = DOMPurify.sanitize(marked.parse(content))
    return (
      <div
        className="text-sm leading-relaxed prose prose-sm max-w-none prose-a:text-blue-600 prose-a:underline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } catch (error) {
    console.error('Markdown parse error:', error)
    return <div className="text-sm text-red-600">内容解析失败</div>
  }
}
