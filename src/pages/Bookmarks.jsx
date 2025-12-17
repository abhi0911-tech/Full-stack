import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { getBookmarks } from '../services/bookmarkService';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch bookmarks from localStorage
    const savedBookmarks = getBookmarks();
    setBookmarks(savedBookmarks);
  }, []);

  const handleCardClick = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/movies/${item.id}`, { state: { item } });
    } else {
      navigate(`/tv-series/${item.id}`, { state: { item } });
    }
  };

  // Separate bookmarks by type
  const movieBookmarks = bookmarks.filter(b => b.media_type === 'movie');
  const tvBookmarks = bookmarks.filter(b => b.media_type === 'tv');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">📌 My Bookmarks</h1>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-2xl text-gray-400 mb-2">No bookmarks yet</p>
            <p className="text-gray-500">Start bookmarking your favorite movies and TV series!</p>
          </div>
        ) : (
          <>
            {/* Movies Bookmarks */}
            {movieBookmarks.length > 0 && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-6">
                  🎬 Bookmarked Movies ({movieBookmarks.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {movieBookmarks.map((movie) => (
                    <ContentCard
                      key={movie.id}
                      item={movie}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* TV Series Bookmarks */}
            {tvBookmarks.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-white mb-6">
                  📺 Bookmarked TV Series ({tvBookmarks.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {tvBookmarks.map((series) => (
                    <ContentCard
                      key={series.id}
                      item={series}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
