import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVSeries from './pages/TVSeries';
import Bookmarks from './pages/Bookmarks';
import MovieDetail from './pages/MovieDetail';
import TVSeriesDetail from './pages/TVSeriesDetail';
import Search from './pages/Search';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/tv-series" element={<TVSeries />} />
            <Route path="/tv-series/:id" element={<TVSeriesDetail />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
