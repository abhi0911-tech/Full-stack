import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🎬</span>
            <span className="text-xl font-bold text-white">EntertainmentApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Movies
            </Link>
            <Link
              to="/tv-series"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              TV Series
            </Link>
            <Link
              to="/bookmarks"
              className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <span>📌</span>
              Bookmarks
            </Link>
             <Link
              to="/login"
              className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
