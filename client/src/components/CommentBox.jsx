import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CommentBox({ onSubmit }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('请输入评论内容')
      return
    }

    setLoading(true)
    try {
      await onSubmit(content)
      setContent('')
      toast.success('评论提交成功')
    } catch (error) {
      toast.error(error.message || '评论提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        disabled={loading}
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '提交中...' : '提交评论'}
        </button>
      </div>
    </form>
  )
}
