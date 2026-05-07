export default function MemoCard({ memo }) {
  if (!memo) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        暂无闪念
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="text-sm text-gray-500">
        {formatDate(memo.created_at)}
      </div>

      {memo.tags && memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {memo.tags.map(tag => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="text-gray-800 whitespace-pre-wrap">
        {memo.content}
      </div>

      {memo.image_url && (
        <div className="mt-4">
          <img
            src={memo.image_url}
            alt="闪念图片"
            className="max-w-full rounded-lg"
          />
        </div>
      )}

      {memo.comments && memo.comments.length > 0 && (
        <div className="mt-6 pt-4 border-t space-y-3">
          <div className="font-semibold text-gray-700">历史评论</div>
          {memo.comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded p-3 space-y-1">
              <div className="text-sm text-gray-500">
                {formatDate(comment.created_at)}
              </div>
              <div className="text-gray-700">{comment.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
