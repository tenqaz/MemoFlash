import { useState } from 'react'

export default function TagFilter({ tags, selectedTags, onToggleTag }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = Object.keys(tags).filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 已选标签排在前面
  const sortedTags = [...filteredTags].sort((a, b) => {
    const aSelected = selectedTags.includes(a)
    const bSelected = selectedTags.includes(b)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🏷️</span>
          <span className="text-base font-semibold">标签筛选</span>
        </div>
        <span className="text-sm text-gray-500">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {selectedTags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <>
          <input
            type="text"
            placeholder="搜索标签"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-sm"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sortedTags.map(tag => (
              <label key={tag} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onToggleTag(tag)}
                  className="w-4 h-4 rounded border-sky-500 text-sky-500"
                />
                <span className="text-sm">{tag}</span>
                <span className="text-xs text-gray-500">({tags[tag]})</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
