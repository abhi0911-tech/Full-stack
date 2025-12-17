import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <NavLink to="/" className="text-2xl">🎬</NavLink>
      <NavLink to="/" className="text-gray-300 hover:text-white">🏠</NavLink>
      <NavLink to="/movies" className="text-gray-300 hover:text-white">🎞️</NavLink>
      <NavLink to="/tv-series" className="text-gray-300 hover:text-white">📺</NavLink>
      <NavLink to="/bookmarks" className="text-gray-300 hover:text-white">📌</NavLink>
      <div className="mt-auto">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzMzMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QTwvdGV4dD48L3N2Zz4=" alt="avatar" className="rounded-full" />
      </div>
    </aside>
  );
}
