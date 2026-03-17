import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import ReadingListWidget from './components/ReadingListWidget';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import Search from './pages/Search';
import About from './pages/About';
import Bookmarks from './pages/Bookmarks';
import WorldMap from './pages/WorldMap';
import SentimentDashboard from './pages/SentimentDashboard';
import CustomFeeds from './pages/CustomFeeds';
import NewsComparison from './pages/NewsComparison';

export default function App() {
  return (
    <ThemeProvider>
      <BookmarkProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
            <BreakingNewsTicker />
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/article/*" element={<Article />} />
                <Route path="/search" element={<Search />} />
                <Route path="/about" element={<About />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/map" element={<WorldMap />} />
                <Route path="/sentiment" element={<SentimentDashboard />} />
                <Route path="/feeds" element={<CustomFeeds />} />
                <Route path="/compare" element={<NewsComparison />} />
              </Routes>
            </main>
            <Footer />
            <ReadingListWidget />
          </div>
        </BrowserRouter>
      </BookmarkProvider>
    </ThemeProvider>
  );
}
