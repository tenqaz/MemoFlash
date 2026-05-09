import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { useSelectedTags } from './hooks/useSelectedTags'
import TagFilter from './components/TagFilter'
import MemoCard from './components/MemoCard'

export default function App() {
  const { selectedTags, toggleTag } = useSelectedTags()
  const [tags, setTags] = useState({})
  const [currentMemo, setCurrentMemo] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error(`获取标签失败 (${response.status})`)
      }
      const data = await response.json()
      setTags(data)
    } catch (error) {
      console.error('fetchTags error:', error)
      toast.error(error.message || '网络错误，请稍后重试')
      setTags({})
    }
  }, [])

  const fetchRandomMemo = useCallback(async () => {
    setLoading(true)
    try {
      const url = selectedTags.length > 0
        ? `/api/memos/random?tag_ids=${selectedTags.join(',')}`
        : '/api/memos/random'

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`获取闪念失败 (${response.status})`)
      }
      const data = await response.json()

      if (!data || Object.keys(data).length === 0) {
        toast.error('没有找到符合条件的闪念')
        setCurrentMemo(null)
      } else {
        setCurrentMemo(data)
      }
    } catch (error) {
      console.error('fetchRandomMemo error:', error)
      toast.error(error.message || '网络错误，请稍后重试')
      setCurrentMemo(null)
    } finally {
      setLoading(false)
    }
  }, [selectedTags])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      await fetchRandomMemo()
    }
    if (!cancelled) {
      fetch()
    }
    return () => { cancelled = true }
  }, [fetchRandomMemo])


  return (
    <div className="min-h-screen py-8 px-8" style={{ backgroundColor: '#f0f9ff' }}>
      <Toaster position="top-center" />

      <div className="mx-auto space-y-6" style={{ width: '800px' }}>
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">闪念复习</h1>
        </header>

        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
        />

        <div className="text-center">
          <button
            onClick={fetchRandomMemo}
            disabled={loading}
            className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            style={{ backgroundColor: '#0ea5e9' }}
          >
            {loading ? '加载中...' : '下一条随机闪念'}
          </button>
        </div>

        {currentMemo && <MemoCard memo={currentMemo} />}
      </div>
    </div>
  )
}
