import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { searchContent } from '../services/tmdbService';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (query) {
        setLoading(true);
        const data = await searchContent(query);
        setResults(data);
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleCardClick = (item) => {
    if (item.media_type === 'movie') {
      navigate(`/movies/${item.id}`, { state: { item } });
    } else {
      navigate(`/tv-series/${item.id}`, { state: { item } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          🔍 Search Results
        </h1>
        <p className="text-gray-400 mb-8">
          Results for: <span className="text-white font-bold">"{query}"</span>
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-2xl text-gray-400">Searching...</div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-6xl mb-4">🔎</div>
            <p className="text-2xl text-gray-400">No results found</p>
            <p className="text-gray-500">Try searching for a different movie or TV series</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((item) => (
              <ContentCard
                key={`${item.id}-${item.media_type}`}
                item={item}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
