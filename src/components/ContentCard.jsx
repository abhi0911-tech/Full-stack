import { useState } from 'react';
import { isBookmarked, addBookmark, removeBookmark } from '../services/bookmarkService';
import { IMAGE_BASE_URL } from '../services/tmdbService';

export default function ContentCard({ item, onCardClick }) {
  const [bookmarked, setBookmarked] = useState(
    isBookmarked(item.id, item.media_type)
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const title = item.title || item.name;
  const posterPath = item.poster_path;
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjNGM1NjY4IiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjYTBhZGJhIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  const releaseDate = item.release_date || item.first_air_date || '';
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  // Generate a richer SVG poster client-side for data SVG placeholders
  const escapeXML = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const hashCode = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  };

  const palette = ['#0ea5a4', '#ef4444', '#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#f472b6'];

  const makeEnhancedSVG = (titleText, yearText) => {
    const color = palette[hashCode(titleText) % palette.length];
    const colors = [
      { bg: '#2c3e50', accent: '#3498db', light: '#ecf0f1' },
      { bg: '#8b4513', accent: '#d2691e', light: '#daa520' },
      { bg: '#1a1a2e', accent: '#ff6b6b', light: '#ee5a6f' },
      { bg: '#0d3b66', accent: '#ef476f', light: '#ffd60a' },
      { bg: '#264653', accent: '#2a9d8f', light: '#e76f51' },
      { bg: '#540d6e', accent: '#ee4266', light: '#ffd23f' },
      { bg: '#003d5c', accent: '#118ab2', light: '#06a77d' }
    ];
    const c = colors[hashCode(titleText) % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><defs><linearGradient id="main" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg}"/><stop offset="0.5" stop-color="${c.accent}"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient><linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.2)"/><stop offset="0.5" stop-color="rgba(0,0,0,0.1)"/><stop offset="1" stop-color="rgba(0,0,0,0.7)"/></linearGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/></filter><pattern id="dots" x="20" y="20" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="300" height="450" fill="url(#main)"/><rect width="300" height="450" fill="url(#dots)"/><circle cx="50" cy="80" r="100" fill="rgba(255,255,255,0.15)" filter="url(#shadow)"/><circle cx="250" cy="120" r="80" fill="rgba(0,0,0,0.2)" filter="url(#shadow)"/><circle cx="150" cy="200" r="120" fill="rgba(${parseInt(c.accent.slice(1,3),16)},${parseInt(c.accent.slice(3,5),16)},${parseInt(c.accent.slice(5,7),16)},0.1)" filter="url(#shadow)"/><polygon points="0,250 100,280 0,450" fill="rgba(0,0,0,0.3)"/><polygon points="300,350 200,300 300,450" fill="rgba(255,255,255,0.08)"/><rect width="300" height="450" fill="url(#overlay)"/><rect x="0" y="320" width="300" height="130" fill="rgba(0,0,0,0.75)"/><text x="150" y="375" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">${escapeXML(titleText.substring(0, 25))}</text>${yearText ? `<text x="150" y="405" font-family="Arial, sans-serif" font-size="14" fill="${c.light}" text-anchor="middle">${escapeXML(yearText)}</text>` : ''}<line x1="40" y1="318" x2="260" y2="318" stroke="${c.accent}" stroke-width="2" opacity="0.6"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const initialPoster = posterPath
    ? (posterPath.startsWith('http')
        ? posterPath
        : posterPath.startsWith('data:image/svg+xml')
        ? makeEnhancedSVG(title, year)
        : `${IMAGE_BASE_URL}${posterPath}`)
    : fallbackImage;
  const [imgSrc, setImgSrc] = useState(initialPoster);

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(item.id, item.media_type);
      setBookmarked(false);
    } else {
      addBookmark({
        id: item.id,
        title,
        poster_path: posterPath,
        media_type: item.media_type,
        release_date: releaseDate,
        overview: item.overview,
        vote_average: item.vote_average
      });
      setBookmarked(true);
    }
  };

  return (
    <div
      onClick={() => onCardClick(item)}
      className="group relative cursor-pointer card-shadow transition-all duration-300 aspect-[2/3] w-full"
    >
      {/* Poster Image Container */}
      <div className="w-full h-full relative bg-gray-800">
        <img
          src={imgSrc}
          alt={title}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageFailed(true);
            setImgSrc(fallbackImage);
          }}
          className="w-full h-full object-cover poster-image"
          loading="lazy"
        />
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* small badge */}
      <div className="card-badge">{bookmarked ? '✓' : '📌'}</div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{title}</h3>
        
        {/* Meta Info */}
        <div className="flex gap-2 mb-3 text-xs text-gray-200 flex-wrap">
          <span className="bg-black/60 px-2 py-1 rounded-full">{item.media_type === 'movie' ? '🎬 Movie' : '📺 TV'}</span>
          {year && <span className="bg-black/60 px-2 py-1 rounded-full">📅 {year}</span>}
          {item.vote_average && <span className="bg-yellow-600/80 px-2 py-1 rounded-full">⭐ {item.vote_average.toFixed(1)}</span>}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`w-full py-2 px-3 rounded-lg transition-colors text-sm font-bold ${
            bookmarked 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {bookmarked ? '✓ Bookmarked' : '📌 Bookmark'}
        </button>
      </div>
    </div>
  );
}
