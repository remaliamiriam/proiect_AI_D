import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { PostsListPage } from './pages/PostsListPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';

import { BrowserRouter } from 'react-router-dom';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href.includes('/posts/')) {
        e.preventDefault();
        const postId = target.href.split('/posts/')[1];
        setSelectedPostId(postId);
        setCurrentPage('post-detail');
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'create-post' && !user) {
      setCurrentPage('auth');
      return;
    }
    if (page === 'profile' && !user) {
      setCurrentPage('auth');
      return;
    }
    if (page === 'admin' && !user) {
      setCurrentPage('auth');
      return;
    }
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'home' && <PostsListPage />}
      {currentPage === 'post-detail' && selectedPostId && (
        <PostDetailPage
          postId={selectedPostId}
          onBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'create-post' && <CreatePostPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'admin' && <AdminPage />}
      {currentPage === 'auth' && (
        <AuthPage onSuccess={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
