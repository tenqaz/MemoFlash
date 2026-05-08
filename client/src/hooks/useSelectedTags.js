import { useState, useEffect } from 'react';

const STORAGE_KEY = 'memoflash_selected_tags';

export function useSelectedTags() {
  const [selectedTags, setSelectedTags] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTags));
  }, [selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return { selectedTags, toggleTag };
}
