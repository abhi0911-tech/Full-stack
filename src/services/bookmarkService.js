// Local storage functions for bookmarks
const BOOKMARKS_KEY = 'entertainment_app_bookmarks';

export const getBookmarks = () => {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const addBookmark = (item) => {
  try {
    const bookmarks = getBookmarks();
    const exists = bookmarks.some(b => b.id === item.id && b.media_type === item.media_type);
    if (!exists) {
      bookmarks.push(item);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }
    return bookmarks;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return [];
  }
};

export const removeBookmark = (id, media_type) => {
  try {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => !(b.id === id && b.media_type === media_type));
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return [];
  }
};

export const isBookmarked = (id, media_type) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === id && b.media_type === media_type);
};
