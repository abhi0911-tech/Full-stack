import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getMovieDetails, IMAGE_BASE_URL, fetchSimilarMovies } from '../services/tmdbService';
import ContentCard from '../components/ContentCard';
import { isBookmarked, addBookmark, removeBookmark } from '../services/bookmarkService';

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(location.state?.item || null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!movie);
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjY2NjY2NjIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMzMzMzMzIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  const [imgSrc, setImgSrc] = useState('');
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!movie) {
        const details = await getMovieDetails(id);
        setMovie(details);
      }
      setLoading(false);
    };

    loadMovieDetails();
  }, [id, movie]);

  useEffect(() => {
    if (movie) {
      setBookmarked(isBookmarked(movie.id, 'movie'));
      const poster = movie.poster_path
        ? (movie.poster_path.startsWith('http') ? movie.poster_path : `${IMAGE_BASE_URL}${movie.poster_path}`)
        : fallbackImage;
      setImgSrc(poster);
      (async () => {
        try {
          const sims = await fetchSimilarMovies(movie.id);
          setSimilar(sims || []);
        } catch (err) {
          console.error('Error loading similar movies:', err);
          setSimilar([]);
        }
      })();
    }
  }, [movie]);

  const handleBookmarkClick = () => {
    if (bookmarked) {
      removeBookmark(movie.id, 'movie');
      setBookmarked(false);
    } else {
      addBookmark({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        media_type: 'movie',
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average
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

  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900">
        <p className="text-2xl text-gray-400 mb-4">Movie not found</p>
        <button
          onClick={() => navigate('/movies')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          Back to Movies
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
              alt={movie.title}
              onError={() => setImgSrc(fallbackImage)}
              className="rounded-lg shadow-2xl w-full md:w-auto max-w-sm"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 text-white">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6 text-gray-300">
              {movie.release_date && (
                <span>📅 {new Date(movie.release_date).getFullYear()}</span>
              )}
              {movie.runtime && (
                <span>⏱️ {movie.runtime} minutes</span>
              )}
              {movie.vote_average && (
                <span>⭐ {movie.vote_average.toFixed(1)}/10</span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Genres:</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
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

            {/* Additional Info */}
            {movie.budget && movie.budget > 0 && (
              <div className="mt-8 text-gray-400">
                <p>💰 Budget: ${movie.budget.toLocaleString()}</p>
              </div>
            )}
            {movie.revenue && movie.revenue > 0 && (
              <div className="text-gray-400">
                <p>💵 Revenue: ${movie.revenue.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Similar Section */}
          {similar && similar.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl text-white font-bold mb-4">Similar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {similar.map((s) => (
                  <ContentCard
                    key={s.id}
                    item={{ ...s, media_type: s.media_type || 'movie' }}
                    onCardClick={(it) => navigate(`/movies/${it.id}`, { state: { item: it } })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
