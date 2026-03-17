import { createContext, useContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const BookmarkContext = createContext();

// Strip body to save localStorage space
function toStorable(article) {
  const { body, ...rest } = article;
  return rest;
}

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useLocalStorage('pulsenews-bookmarks', []);

  const addBookmark = useCallback((article) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === article.id)) return prev;
      return [toStorable(article), ...prev];
    });
  }, [setBookmarks]);

  const removeBookmark = useCallback((articleId) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== articleId));
  }, [setBookmarks]);

  const isBookmarked = useCallback((articleId) => {
    return bookmarks.some((b) => b.id === articleId);
  }, [bookmarks]);

  const clearAll = useCallback(() => {
    setBookmarks([]);
  }, [setBookmarks]);

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked, clearAll }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider');
  return ctx;
}
