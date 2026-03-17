import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const REACTION_TYPES = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
];

export default function Reactions({ articleId }) {
  const [allReactions, setAllReactions] = useLocalStorage('pulsenews-reactions', {});
  const [userReaction, setUserReaction] = useLocalStorage(`pulsenews-reacted-${articleId}`, null);

  const reactions = allReactions[articleId] || {};

  const handleReact = (emoji) => {
    setAllReactions((prev) => {
      const article = { ...(prev[articleId] || {}) };

      // Remove old reaction
      if (userReaction) {
        article[userReaction] = Math.max(0, (article[userReaction] || 1) - 1);
        if (article[userReaction] === 0) delete article[userReaction];
      }

      // Toggle off if same emoji
      if (userReaction === emoji) {
        setUserReaction(null);
        return { ...prev, [articleId]: article };
      }

      // Add new reaction
      article[emoji] = (article[emoji] || 0) + 1;
      setUserReaction(emoji);
      return { ...prev, [articleId]: article };
    });
  };

  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTION_TYPES.map(({ emoji, label }) => {
        const count = reactions[emoji] || 0;
        const isActive = userReaction === emoji;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            title={label}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all ${
              isActive
                ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 border border-[#e05d44]/30 dark:border-[#e87461]/30 scale-110'
                : 'bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--text-muted)] hover:scale-105'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#e05d44] dark:text-[#e87461]' : 'text-[var(--text-muted)]'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
      {total > 0 && (
        <span className="text-[10px] text-[var(--text-muted)] ml-2">{total} reaction{total !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
