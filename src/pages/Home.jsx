import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ContentCard from '../components/ContentCard';
import { fetchTrendingMovies, fetchTrendingTVSeries } from '../services/tmdbService';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTVSeries, setTrendingTVSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTrendingContent = async () => {
      try {
        setLoading(true);
        const [movies, tvSeries] = await Promise.all([
          fetchTrendingMovies(),
          fetchTrendingTVSeries()
        ]);
        
        setTrendingMovies(movies || []);
        setTrendingTVSeries(tvSeries || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingContent();
  }, []);

  const handleCardClick = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/movies/${item.id}`, { state: { item } });
    } else {
      navigate(`/tv-series/${item.id}`, { state: { item } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative bg-slate-900 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl sm:text-7xl font-bold text-white mb-6">
            Trending
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl">
            Discover the most popular movies and TV series right now
          </p>
          <div className="max-w-xl">
            <SearchBar onSearch={() => {}} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎬</div>
              <div className="text-2xl text-gray-400">Loading your content...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Trending Movies Section */}
            {trendingMovies.length > 0 && (
              <section className="mb-20">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-5xl">🎬</span>
                  <h2 className="text-4xl font-bold text-white">Trending Movies</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingMovies.slice(0, 12).map((movie) => (
                    <ContentCard
                      key={movie.id}
                      item={{ ...movie, media_type: 'movie' }}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Trending TV Series Section */}
            {trendingTVSeries.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-5xl">📺</span>
                  <h2 className="text-4xl font-bold text-white">Trending TV Series</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingTVSeries.slice(0, 12).map((tvSeries) => (
                    <ContentCard
                      key={tvSeries.id}
                      item={{ ...tvSeries, media_type: 'tv' }}
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
