import { useState, useEffect } from 'react';

const STORAGE_KEY = 'memoflash_selected_tags';

export function useSelectedTags() {
  const [selectedTags, setSelectedTags] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('localStorage read failed:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTags));
    } catch (error) {
      console.error('localStorage write failed:', error);
    }
  }, [selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return { selectedTags, toggleTag };
}
