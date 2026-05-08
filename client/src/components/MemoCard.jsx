import MarkdownContent from './MarkdownContent'

export default function MemoCard({ memo }) {
  if (!memo) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        暂无闪念
      </div>
    )
  }

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleString('zh-CN')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200" style={{ boxShadow: '0 2px 8px rgba(14, 165, 233, 0.1)' }}>
      <div className="p-6 space-y-2">
        <div className="text-xs text-gray-500">{formatTime(memo.createTime)}</div>
        <div className="flex gap-2 flex-wrap">
          {memo.tags?.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        <MarkdownContent content={memo.content} />

        {memo.attachments && memo.attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {memo.attachments.map(attachment => (
              <img
                key={attachment.name}
                src={attachment.externalLink}
                alt=""
                className="w-32 h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {memo.relations && memo.relations.length > 0 && (
          <>
            <div className="border-t border-gray-200"></div>
            <div className="text-sm font-medium text-gray-600">历史评论</div>
            {memo.relations.map(relation => (
              <div key={relation.relatedMemo} className="space-y-1">
                <div className="text-xs text-gray-500">{formatTime(relation.memo.createTime)}</div>
                <MarkdownContent content={relation.memo.content} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
