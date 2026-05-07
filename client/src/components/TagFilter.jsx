import { useState } from 'react'

export default function TagFilter({ tags = [], selectedTags = [], onTagChange }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (tagId) => {
    const newSelected = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]
    onTagChange(newSelected)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-lg font-semibold mb-2"
      >
        <span>标签筛选</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="搜索标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTags.map(tag => (
              <label key={tag.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleToggle(tag.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1">{tag.name}</span>
                <span className="text-sm text-gray-500">({tag.count || 0})</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
