import axios from 'axios';

// Prefer Vite env variable for the API key. Create a .env with VITE_TMDB_API_KEY=your_key
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
if (!API_KEY) {
  console.warn('[tmdbService] No TMDB API key found in import.meta.env.VITE_TMDB_API_KEY — using mock data and SVG fallbacks.');
}
// When true, skip calling the TMDB API because key was invalid or we detected failures
let SKIP_API = false;

const handleApiError = (err, context = '') => {
  const status = err?.response?.status;
  if (status === 401) {
    SKIP_API = true;
    console.warn(`[tmdbService] TMDB API returned 401 for ${context} — falling back to mock data.`);
    return true;
  }
  console.error(`Error ${context}:`, err);
  return false;
};
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Static pre-encoded SVG data URIs (guaranteed to work everywhere, no btoa() needed)
const SVG_POSTERS = {
  fight_club: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjRkY2QjZCIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+RmlnaHQgQ2x1YjwvdGV4dD48L3N2Zz4=',
  shawshank: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjNEVDREMzIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U2hhd3NoYW5rPC90ZXh0Pjwvc3ZnPg==',
  godfather: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDAwMDAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+R29kZmF0aGVyPC90ZXh0Pjwvc3ZnPg==',
  dark_knight: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMUExQTFBIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+RGFyayBLbmlnaHQ8L3RleHQ+PC9zdmc+',
  inception: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjNjY3QkM2IiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+SW5jZXB0aW9uPC90ZXh0Pjwvc3ZnPg==',
  pulp_fiction: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjRkZBNTAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+UHVscCBGaWN0aW9uPC90ZXh0Pjwvc3ZnPg==',
  forrest_gump: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjQzBDMEMwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+Rm9ycmVzdCBHdW1wPC90ZXh0Pjwvc3ZnPg==',
  matrix: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBGRjAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+VGhlIE1hdHJpeDwvdGV4dD48L3N2Zz4=',
  interstellar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMkM1MjgyIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+SW50ZXJzdGVsbGFyPC90ZXh0Pjwvc3ZnPg==',
  avengers: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjREMxNDNDIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+QXZlbmdlcnM8L3RleHQ+PC9zdmc+',
  avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMUU5MkZGIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+QXZhdGFyPC90ZXh0Pjwvc3ZnPg==',
  se7en: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjOEIwMDAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U2U3ZW48L3RleHQ+PC9zdmc+',
  breaking_bad: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjRkZENzAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+QnJlYWtpbmcgQmFkPC90ZXh0Pjwvc3ZnPg==',
  game_of_thrones: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDAwMDAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjRkZENzAwIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBvZiBUaHJvbmVzPC90ZXh0Pjwvc3ZnPg==',
  the_office: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjOEI0NTEzIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+VGhlIE9mZmljZTwvdGV4dD48L3N2Zz4=',
  stranger_things: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjRkYxNDkzIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U3RyYW5nZXIgVGhpbmdzzz4vdGV4dD48L3N2Zz4=',
  the_crown: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjRkZENzAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMDAwIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+VGhlIENyb3duPC90ZXh0Pjwvc3ZnPg==',
  friends: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMDBDRUQxIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+RnJpZW5kczwvdGV4dD48L3N2Zz4=',
};

// Helper to merge real TMDB results with SVG fallbacks for missing posters
const enrichResultsWithFallbacks = (results, mockData) => {
  if (!results || results.length === 0) return mockData;
  
  return results.map((item) => {
    const mockItem = mockData.find(m => m.id === item.id);
    // If TMDB item has a poster_path, keep it; otherwise use SVG fallback from mock
    if (!item.poster_path && mockItem) {
      return { ...item, poster_path: mockItem.poster_path };
    }
    return item;
  });
};

// Mock data with static SVG data URIs (guaranteed to work everywhere)
const MOCK_MOVIES = [
  { id: 550, title: 'Fight Club', poster_path: SVG_POSTERS.fight_club, media_type: 'movie', release_date: '1999-10-15', vote_average: 8.8, overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into much more.' },
  { id: 278, title: 'The Shawshank Redemption', poster_path: SVG_POSTERS.shawshank, media_type: 'movie', release_date: '1994-09-23', vote_average: 9.3, overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.' },
  { id: 238, title: 'The Godfather', poster_path: SVG_POSTERS.godfather, media_type: 'movie', release_date: '1972-03-24', vote_average: 9.2, overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.' },
  { id: 155, title: 'The Dark Knight', poster_path: SVG_POSTERS.dark_knight, media_type: 'movie', release_date: '2008-07-18', vote_average: 9.0, overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.' },
  { id: 27205, title: 'Inception', poster_path: SVG_POSTERS.inception, media_type: 'movie', release_date: '2010-07-16', vote_average: 8.8, overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.' },
  { id: 680, title: 'Pulp Fiction', poster_path: SVG_POSTERS.pulp_fiction, media_type: 'movie', release_date: '1994-10-14', vote_average: 8.9, overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.' },
  { id: 13, title: 'Forrest Gump', poster_path: SVG_POSTERS.forrest_gump, media_type: 'movie', release_date: '1994-07-06', vote_average: 8.8, overview: 'The presidencies of Kennedy and Johnson unfold from the perspective of an Alabama man with an IQ of 75.' },
  { id: 603, title: 'The Matrix', poster_path: SVG_POSTERS.matrix, media_type: 'movie', release_date: '1999-03-31', vote_average: 8.7, overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.' },
  { id: 24428, title: 'Interstellar', poster_path: SVG_POSTERS.interstellar, media_type: 'movie', release_date: '2014-11-07', vote_average: 8.6, overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
  { id: 100402, title: 'The Avengers', poster_path: SVG_POSTERS.avengers, media_type: 'movie', release_date: '2012-05-04', vote_average: 8.0, overview: "Earth's mightiest heroes must come together and learn to fight as a team to save the world." },
  { id: 19995, title: 'Avatar', poster_path: SVG_POSTERS.avatar, media_type: 'movie', release_date: '2009-12-18', vote_average: 7.8, overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and his new world." },
  { id: 807, title: 'Se7en', poster_path: SVG_POSTERS.se7en, media_type: 'movie', release_date: '1995-09-22', vote_average: 8.6, overview: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.' }
];

const MOCK_TV_SERIES = [
  { id: 1396, name: 'Breaking Bad', poster_path: SVG_POSTERS.breaking_bad, media_type: 'tv', first_air_date: '2008-01-20', vote_average: 9.5, overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to cooking methamphetamine with a former student.' },
  { id: 1399, name: 'Game of Thrones', poster_path: SVG_POSTERS.game_of_thrones, media_type: 'tv', first_air_date: '2011-04-17', vote_average: 9.2, overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient evil awakens in the far North.' },
  { id: 2316, name: 'The Office', poster_path: SVG_POSTERS.the_office, media_type: 'tv', first_air_date: '2005-03-24', vote_average: 9.0, overview: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.' },
  { id: 66573, name: 'Stranger Things', poster_path: SVG_POSTERS.stranger_things, media_type: 'tv', first_air_date: '2016-07-15', vote_average: 8.7, overview: 'When a young boy disappears, his friends, family and local police uncover a mystery involving secret government experiments.' },
  { id: 46952, name: 'The Crown', poster_path: SVG_POSTERS.the_crown, media_type: 'tv', first_air_date: '2016-11-04', vote_average: 8.6, overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century." },
  { id: 1668, name: 'Friends', poster_path: SVG_POSTERS.friends, media_type: 'tv', first_air_date: '1994-09-22', vote_average: 8.9, overview: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.' },
  { id: 1400, name: 'The Sopranos', poster_path: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjOEIwMDAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U29wcmFub3M8L3RleHQ+PC9zdmc+', media_type: 'tv', first_air_date: '1999-01-10', vote_average: 9.2, overview: 'New Jersey mob boss Tony Soprano deals with personal and professional struggles in his home and business life.' },
  { id: 19885, name: 'Sherlock', poster_path: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMkMzRTUwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U2hlcmxvY2s8L3RleHQ+PC9zdmc+', media_type: 'tv', first_air_date: '2010-07-25', vote_average: 9.1, overview: 'A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.' },
  { id: 82856, name: 'The Mandalorian', poster_path: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjNEIwMDgyIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+TWFuZGFsb3JpYW48L3RleHQ+PC9zdmc+', media_type: 'tv', first_air_date: '2019-11-12', vote_average: 8.7, overview: 'After the fall of the Empire, a lone bounty hunter operates in the outer reaches of the galaxy.' },
  { id: 54613, name: 'Succession', poster_path: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjREMxNDNDIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+U3VjY2Vzc2lvbjwvdGV4dD48L3N2Zz4=', media_type: 'tv', first_air_date: '2018-06-03', vote_average: 8.9, overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world.' },
  { id: 1402, name: 'The Wire', poster_path: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjNjk2OTY5IiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+VGhlIFdpcmU8L3RleHQ+PC9zdmc+', media_type: 'tv', first_air_date: '2002-06-02', vote_average: 9.3, overview: 'Baltimore homicide detective Jimmy McNulty is forced to work with criminals to solve murders.' }
];

// Single axios instance
const apiClient = axios.create({ baseURL: BASE_URL });

// helper that attaches api_key param only when API_KEY is provided
const tmdbGet = (path, params = {}) => {
  if (API_KEY) return apiClient.get(path, { params: { api_key: API_KEY, ...params } });
  return apiClient.get(path, { params });
};

export const fetchTrendingMovies = async () => {
  if (SKIP_API || !API_KEY) return MOCK_MOVIES;
  try {
    const response = await tmdbGet('/trending/movie/week');
    if (response.data?.results?.length) {
      // Enrich with fallbacks: if TMDB has no poster_path, use SVG
      return enrichResultsWithFallbacks(response.data.results, MOCK_MOVIES);
    }
    return MOCK_MOVIES;
  } catch (err) {
    if (handleApiError(err, 'fetchTrendingMovies')) return MOCK_MOVIES;
    return MOCK_MOVIES;
  }
};

export const fetchTrendingTVSeries = async () => {
  if (SKIP_API || !API_KEY) return MOCK_TV_SERIES;
  try {
    const response = await tmdbGet('/trending/tv/week');
    if (response.data?.results?.length) {
      // Enrich with fallbacks: if TMDB has no poster_path, use SVG
      return enrichResultsWithFallbacks(response.data.results, MOCK_TV_SERIES);
    }
    return MOCK_TV_SERIES;
  } catch (err) {
    if (handleApiError(err, 'fetchTrendingTVSeries')) return MOCK_TV_SERIES;
    return MOCK_TV_SERIES;
  }
};

export const fetchAllMovies = async (page = 1) => {
  if (SKIP_API || !API_KEY) return MOCK_MOVIES;
  try {
    const response = await tmdbGet('/movie/popular', { page });
    if (response.data?.results?.length) {
      // Enrich with fallbacks: if TMDB has no poster_path, use SVG
      return enrichResultsWithFallbacks(response.data.results, MOCK_MOVIES);
    }
    return MOCK_MOVIES;
  } catch (err) {
    if (handleApiError(err, 'fetchAllMovies')) return MOCK_MOVIES;
    return MOCK_MOVIES;
  }
};

export const fetchAllTVSeries = async (page = 1) => {
  if (SKIP_API || !API_KEY) return MOCK_TV_SERIES;
  try {
    const response = await tmdbGet('/tv/popular', { page });
    if (response.data?.results?.length) {
      // Enrich with fallbacks: if TMDB has no poster_path, use SVG
      return enrichResultsWithFallbacks(response.data.results, MOCK_TV_SERIES);
    }
    return MOCK_TV_SERIES;
  } catch (err) {
    if (handleApiError(err, 'fetchAllTVSeries')) return MOCK_TV_SERIES;
    return MOCK_TV_SERIES;
  }
};

export const searchContent = async (query) => {
  if (SKIP_API || !API_KEY) {
    const all = [...MOCK_MOVIES, ...MOCK_TV_SERIES];
    return all.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()) || item.name?.toLowerCase().includes(query.toLowerCase()));
  }
  try {
    const response = await tmdbGet('/search/multi', { query });
    if (response.data?.results?.length) {
      return response.data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv');
    }
    const all = [...MOCK_MOVIES, ...MOCK_TV_SERIES];
    return all.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()) || item.name?.toLowerCase().includes(query.toLowerCase()));
  } catch (err) {
    if (handleApiError(err, 'searchContent')) {
      const all = [...MOCK_MOVIES, ...MOCK_TV_SERIES];
      return all.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()) || item.name?.toLowerCase().includes(query.toLowerCase()));
    }
    const all = [...MOCK_MOVIES, ...MOCK_TV_SERIES];
    return all.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()) || item.name?.toLowerCase().includes(query.toLowerCase()));
  }
};

export const getMovieDetails = async (id) => {
  if (SKIP_API || !API_KEY) return MOCK_MOVIES.find(m => m.id === parseInt(id)) || null;
  try {
    const response = await tmdbGet(`/movie/${id}`);
    return response.data;
  } catch (err) {
    if (handleApiError(err, 'getMovieDetails')) return MOCK_MOVIES.find(m => m.id === parseInt(id)) || null;
    return MOCK_MOVIES.find(m => m.id === parseInt(id)) || null;
  }
};

export const getTVSeriesDetails = async (id) => {
  if (SKIP_API || !API_KEY) return MOCK_TV_SERIES.find(s => s.id === parseInt(id)) || null;
  try {
    const response = await tmdbGet(`/tv/${id}`);
    return response.data;
  } catch (err) {
    if (handleApiError(err, 'getTVSeriesDetails')) return MOCK_TV_SERIES.find(s => s.id === parseInt(id)) || null;
    return MOCK_TV_SERIES.find(s => s.id === parseInt(id)) || null;
  }
};

// Fetch similar movies for a given movie id
export const fetchSimilarMovies = async (movieId) => {
  if (SKIP_API || !API_KEY) return [];
  try {
    const response = await tmdbGet(`/movie/${movieId}/similar`);
    if (response.data?.results?.length) return response.data.results;
    return [];
  } catch (err) {
    handleApiError(err, 'fetchSimilarMovies');
    return [];
  }
};

// Fetch similar TV series for a given tv id
export const fetchSimilarTVSeries = async (tvId) => {
  if (SKIP_API || !API_KEY) return [];
  try {
    const response = await tmdbGet(`/tv/${tvId}/similar`);
    if (response.data?.results?.length) return response.data.results;
    return [];
  } catch (err) {
    handleApiError(err, 'fetchSimilarTVSeries');
    return [];
  }
};

export { IMAGE_BASE_URL };
