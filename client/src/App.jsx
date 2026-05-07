import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useSelectedTags } from './hooks/useSelectedTags'
import TagFilter from './components/TagFilter'
import MemoCard from './components/MemoCard'
import CommentBox from './components/CommentBox'

export default function App() {
  const { selectedTags, toggleTag } = useSelectedTags()
  const [tags, setTags] = useState([])
  const [currentMemo, setCurrentMemo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('获取标签失败')
      const data = await response.json()
      setTags(data)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchRandomMemo = async () => {
    setLoading(true)
    try {
      const url = selectedTags.length > 0
        ? `/api/memos/random?tag_ids=${selectedTags.join(',')}`
        : '/api/memos/random'

      const response = await fetch(url)
      if (!response.ok) throw new Error('获取闪念失败')
      const data = await response.json()
      setCurrentMemo(data)
    } catch (error) {
      toast.error(error.message)
      setCurrentMemo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (content) => {
    if (!currentMemo) return

    const response = await fetch(`/api/memos/${currentMemo.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })

    if (!response.ok) throw new Error('提交评论失败')

    await fetchRandomMemo()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">闪念复习</h1>
        </header>

        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          onTagChange={(newTags) => {
            newTags.forEach(tag => {
              if (!selectedTags.includes(tag)) toggleTag(tag)
            })
            selectedTags.forEach(tag => {
              if (!newTags.includes(tag)) toggleTag(tag)
            })
          }}
        />

        <div className="text-center">
          <button
            onClick={fetchRandomMemo}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {loading ? '加载中...' : '获取随机闪念'}
          </button>
        </div>

        {currentMemo && (
          <>
            <MemoCard memo={currentMemo} />
            <CommentBox onSubmit={handleCommentSubmit} />
          </>
        )}
      </div>
    </div>
  )
}
