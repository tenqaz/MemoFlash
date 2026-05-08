import { useState } from 'react'

export default function TagFilter({ tags, selectedTags, onToggleTag }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = Object.keys(tags).filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏷️</span>
          <span className="text-base font-semibold">标签筛选</span>
          {!isExpanded && selectedTags.length > 0 && (
            <span className="text-sm text-gray-500">
              ：{selectedTags.join(', ')}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1 bg-sky-100 rounded-md text-sm"
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

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
            {filteredTags.map(tag => (
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
