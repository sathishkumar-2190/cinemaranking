import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import MovieDetails from "./pages/MovieDetails";
import PersonPage from "./pages/PersonPage";
import SearchResults from "./pages/SearchResults";
import Watchlist from "./pages/Watchlist";
import RankingsPage from "./pages/RankingsPage";
import UpcomingPage from "./pages/UpcomingPage";
import DiscoverPage from "./pages/DiscoverPage";
import KeywordsPage from "./pages/KeywordsPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-neutral-900 min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/"                       element={<Home />} />
          <Route path="/movies"                 element={<MoviesPage />} />
          <Route path="/series"                 element={<SeriesPage />} />
          <Route path="/search"                 element={<SearchResults />} />
          <Route path="/watchlist"              element={<Watchlist />} />
          <Route path="/rankings"               element={<RankingsPage />} />
          <Route path="/upcoming"               element={<UpcomingPage />} />
          <Route path="/discover"               element={<DiscoverPage />} />
          <Route path="/keywords"               element={<KeywordsPage />} />
          <Route path="/auth"                   element={<AuthPage />} />
          <Route path="/profile"                element={<ProfilePage />} />
          <Route path="/details/:mediaType/:id" element={<MovieDetails />} />
          <Route path="/person/:personId"       element={<PersonPage />} />
          <Route path="*"                       element={<div className="p-10">Page Not Found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;