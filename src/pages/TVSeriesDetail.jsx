import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getTVSeriesDetails, IMAGE_BASE_URL, fetchSimilarTVSeries } from '../services/tmdbService';
import ContentCard from '../components/ContentCard';
import { isBookmarked, addBookmark, removeBookmark } from '../services/bookmarkService';

export default function TVSeriesDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [series, setSeries] = useState(location.state?.item || null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!series);
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjY2NjY2NjIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMzMzMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  const [imgSrc, setImgSrc] = useState('');
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const loadSeriesDetails = async () => {
      if (!series) {
        const details = await getTVSeriesDetails(id);
        setSeries(details);
      }
      setLoading(false);
    };

    loadSeriesDetails();
  }, [id, series]);

  useEffect(() => {
    if (series) {
      setBookmarked(isBookmarked(series.id, 'tv'));
    }
  }, [series]);

  useEffect(() => {
    if (series) {
      const poster = series.poster_path
        ? (series.poster_path.startsWith('http') ? series.poster_path : `${IMAGE_BASE_URL}${series.poster_path}`)
        : fallbackImage;
      setImgSrc(poster);
      (async () => {
        try {
          const sims = await fetchSimilarTVSeries(series.id);
          setSimilar(sims || []);
        } catch (err) {
          console.error('Error loading similar tv series:', err);
          setSimilar([]);
        }
      })();
    }
  }, [series]);

  const handleBookmarkClick = () => {
    if (bookmarked) {
      removeBookmark(series.id, 'tv');
      setBookmarked(false);
    } else {
      addBookmark({
        id: series.id,
        title: series.name,
        poster_path: series.poster_path,
        media_type: 'tv',
        release_date: series.first_air_date,
        overview: series.overview,
        vote_average: series.vote_average
      });
      setBookmarked(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
        <p className="text-2xl text-gray-400 mb-4">TV Series not found</p>
        <button
          onClick={() => navigate('/tv-series')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          Back to TV Series
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="m-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
      >
        ← Back
      </button>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="flex justify-center">
            <img
              src={imgSrc || fallbackImage}
              alt={series.name}
              onError={() => setImgSrc(fallbackImage)}
              className="rounded-lg shadow-2xl w-full md:w-auto max-w-sm"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 text-white">
            <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-gray-300">
              {series.first_air_date && (
                <span>📅 {new Date(series.first_air_date).getFullYear()}</span>
              )}
              {series.number_of_seasons && (
                <span>📺 {series.number_of_seasons} Season{series.number_of_seasons > 1 ? 's' : ''}</span>
              )}
              {series.number_of_episodes && (
                <span>📽️ {series.number_of_episodes} Episodes</span>
              )}
              {series.vote_average && (
                <span>⭐ {series.vote_average.toFixed(1)}/10</span>
              )}
            </div>

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Genres:</h3>
                <div className="flex flex-wrap gap-2">
                  {series.genres.map((genre) => (
                    <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                  {/* Similar Section */}
                  {similar && similar.length > 0 && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                      <div className="mt-12">
                        <h2 className="text-2xl text-white font-bold mb-4">Similar</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {similar.map((s) => (
                            <ContentCard
                              key={s.id}
                              item={{ ...s, media_type: s.media_type || 'tv' }}
                              onCardClick={(it) => navigate(`/tv-series/${it.id}`, { state: { item: it } })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview */}
            {series.overview && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{series.overview}</p>
              </div>
            )}

            {/* Status */}
            {series.status && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Status</h3>
                <p className="text-gray-300">{series.status}</p>
              </div>
            )}

            {/* Bookmark Button */}
            <button
              onClick={handleBookmarkClick}
              className={`px-8 py-3 font-bold rounded-lg transition-colors text-lg ${
                bookmarked
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {bookmarked ? '✓ Bookmarked' : '📌 Add to Bookmarks'}
            </button>

            {/* Network Info */}
            {series.networks && series.networks.length > 0 && (
              <div className="mt-8 text-gray-400">
                <p className="mb-2">Networks:</p>
                <div className="flex flex-wrap gap-2">
                  {series.networks.map((network) => (
                    <span key={network.id} className="bg-gray-800 px-3 py-1 rounded text-sm">
                      {network.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
