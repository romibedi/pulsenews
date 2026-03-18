import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { AudioProvider } from './contexts/AudioContext';
import { LanguageProvider } from './hooks/useLanguage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomTabBar from './components/BottomTabBar';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import ReadingListWidget from './components/ReadingListWidget';
import AudioPlayer from './components/AudioPlayer';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import Search from './pages/Search';
import About from './pages/About';
import Bookmarks from './pages/Bookmarks';
import Region from './pages/Region';
import Explore from './pages/Explore';
import Settings from './pages/Settings';

const CustomFeeds = lazy(() => import('./pages/CustomFeeds'));

function PageLoader() {
  return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[var(--text-muted)]">Loading...</div>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <AudioProvider>
      <BookmarkProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
            <BreakingNewsTicker />
            <Navbar />
            <main className="flex-1 pb-[calc(49px+env(safe-area-inset-bottom,0px))] md:pb-0">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:category" element={<Category />} />
                  <Route path="/region/:region" element={<Region />} />
                  <Route path="/article/*" element={<Article />} />
                  <Route path="/news/:slug" element={<Article />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/feeds" element={<CustomFeeds />} />
                </Routes>
              </Suspense>
            </main>
            <div className="hidden md:block">
              <Footer />
            </div>
            <div className="hidden md:block">
              <ReadingListWidget />
            </div>
            <AudioPlayer />
            <BottomTabBar />
          </div>
        </BrowserRouter>
      </BookmarkProvider>
      </AudioProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
