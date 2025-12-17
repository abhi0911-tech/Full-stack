import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { fetchAllTVSeries } from '../services/tmdbService';

export default function TVSeries() {
  const [tvSeries, setTVSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTVSeries = async () => {
      setLoading(true);
      const data = await fetchAllTVSeries(page);
      setTVSeries(data);
      setLoading(false);
    };

    loadTVSeries();
  }, [page]);

  const handleCardClick = (item) => {
    navigate(`/tv-series/${item.id}`, { state: { item } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">📺 TV Series</h1>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-2xl text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {tvSeries.map((series) => (
                <ContentCard
                  key={series.id}
                  item={{ ...series, media_type: 'tv' }}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                ← Previous
              </button>
              <span className="text-white py-2 font-bold">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
