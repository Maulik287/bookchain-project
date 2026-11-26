import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import BookJourneyModal from './components/BookJourneyModal';
import ClaimModal from './components/ClaimModal';
import ListBookModal from './components/ListBookModal';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import AuthGate from './components/AuthGate';
import SynopsisModal from './components/SynopsisModal';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import AdminPanel from './components/AdminPanel';
import { BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'dashboard'

  // Catalogue and filters
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [journeyBook, setJourneyBook] = useState(null);
  const [claimBook, setClaimBook] = useState(null);
  const [paymentBook, setPaymentBook] = useState(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSynopsisModalOpen, setIsSynopsisModalOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Always require manual login first on launch - NEVER directly sign in
  useEffect(() => {
    // Clear any previous persisted session so the login screen always appears first
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setCurrentUser(null);

    const initAuth = async () => {
      try {
        await fetchDemoUsers();
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Fetch books when filters change
  useEffect(() => {
    if (currentUser) {
      fetchBooks();
    }
  }, [currentUser, searchQuery, selectedGenre, selectedCondition, selectedStatus]);

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      const data = await res.json();
      if (data.success && data.users.length > 0) {
        setDemoUsers(data.users);
      }
    } catch (err) {
      console.error('Error loading demo users:', err);
    }
  };

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (selectedCondition !== 'All') params.append('condition', selectedCondition);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);

      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleQuickSwitch = async (userId) => {
    try {
      const res = await fetch('/api/auth/quick-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        showToast(`Active Session: ${data.user.name} (${data.user.usn})`, 'info');
      }
    } catch (err) {
      console.error('Quick switch error:', err);
    }
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin');
      showToast(`Welcome to Admin Panel, ${user.name}!`);
    } else {
      setActiveTab('catalogue');
      showToast(`Welcome, ${user.name}! Signed in as ${user.email}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setCurrentUser(null);
    showToast('Signed out successfully. Please log in to continue.', 'info');
  };

  const handleOpenListModal = () => {
    if (!currentUser) {
      showToast('Please sign in with your Name, USN, Date of Birth & CAPTCHA to list a book.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setIsListModalOpen(true);
  };

  const handleOpenClaim = (book) => {
    if (!currentUser) {
      showToast('Please sign in with your Name, USN, Date of Birth & CAPTCHA to claim this book.', 'error');
      setIsAuthModalOpen(true);
      return;
    }
    setClaimBook(book);
  };

  const handleBookListed = (newBook) => {
    setBooks(prev => [newBook, ...prev]);
    showToast(`'${newBook.title}' listed on the exchange chain!`);
  };

  const handleClaimSuccess = (updatedBook) => {
    setBooks(prev => prev.map(b => b._id === updatedBook._id ? updatedBook : b));
    showToast(`Successfully claimed '${updatedBook.title}'! Handover recorded in Ownership History.`);
  };

  const handleRelistBook = async (book) => {
    try {
      const res = await fetch(`/api/claims/${book._id}/relist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          condition: book.condition,
          notes: 'Exam completed. Passing forward to the next peer in chain!'
        })
      });
      const data = await res.json();
      if (res.status === 402 && data.requirePayment) {
        showToast(data.message, 'error');
        setPaymentBook(book);
        return;
      }
      if (data.success) {
        setBooks(prev => prev.map(b => b._id === book._id ? data.data : b));
        showToast(data.message || `'${book.title}' passed forward!`);
      } else {
        showToast(data.message || 'Failed to pass book on', 'error');
      }
    } catch (err) {
      showToast('Error passing book on: ' + err.message, 'error');
    }
  };

  const handleRequestBook = async (book) => {
    try {
      const res = await fetch(`/api/claims/${book._id}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.map(b => b._id === book._id ? data.data : b));
        showToast(data.message);
      } else {
        showToast(data.message || 'Could not join request queue', 'error');
      }
    } catch (err) {
      showToast('Error requesting book: ' + err.message, 'error');
    }
  };

  const handleCancelRequest = async (book) => {
    try {
      const res = await fetch(`/api/claims/${book._id}/request`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBooks(prev => prev.map(b => b._id === book._id ? data.data : b));
        showToast(data.message, 'info');
      } else {
        showToast(data.message || 'Could not leave queue', 'error');
      }
    } catch (err) {
      showToast('Error leaving queue: ' + err.message, 'error');
    }
  };

  const handlePaymentSuccess = (updatedBook, payment) => {
    setBooks(prev => prev.map(b => b._id === updatedBook._id ? updatedBook : b));
    showToast(`Penalty of ₹${payment.amount} cleared (${payment.txnId})! You can now Pass It On.`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSelectedCondition('All');
    setSelectedStatus('All');
  };

  // 1. Session check loading state
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090d16',
        color: '#818cf8',
        gap: '1rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#818cf8',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Checking Student Credentials...</span>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate: Must authenticate before entering BookChain
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16' }}>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            border: toast.type === 'error' ? '1px solid #f87171' : '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backdropFilter: 'blur(10px)',
            animation: 'scaleUp 0.25s ease'
          }}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#34d399" />}
            <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{toast.message}</span>
          </div>
        )}

        <AuthGate
          onAuthSuccess={handleAuthSuccess}
          demoUsers={demoUsers}
          onOpenSynopsis={() => setIsSynopsisModalOpen(true)}
        />

        <SynopsisModal
          isOpen={isSynopsisModalOpen}
          onClose={() => setIsSynopsisModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)',
          border: toast.type === 'error' ? '1px solid #f87171' : '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          backdropFilter: 'blur(10px)',
          animation: 'scaleUp 0.25s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#34d399" />}
          <span style={{ fontSize: '0.88rem', fontWeight: '500' }}>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        demoUsers={demoUsers}
        onSwitchUser={handleQuickSwitch}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenListModal={handleOpenListModal}
        onOpenSynopsis={() => setIsSynopsisModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        {activeTab === 'catalogue' ? (
          <>
            <Hero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onResetFilters={handleResetFilters}
              booksCount={books.length}
            />

            {/* Book Cards Grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem 1.5rem' }}>
              {loadingBooks ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  Loading academic book catalogue...
                </div>
              ) : books.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <BookOpen size={36} color="#64748b" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                    No books matched your filter
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                    Try resetting your search query or branch filters.
                  </p>
                  <button onClick={handleResetFilters} className="btn-secondary">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {books.map(book => (
                    <BookCard
                      key={book._id}
                      book={book}
                      currentUser={currentUser}
                      onViewJourney={(b) => setJourneyBook(b)}
                      onClaimBook={handleOpenClaim}
                      onRelistBook={handleRelistBook}
                      onRequestBook={handleRequestBook}
                      onCancelRequest={handleCancelRequest}
                      onOpenPayment={(b) => setPaymentBook(b)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'admin' && currentUser?.role === 'admin' ? (
          <AdminPanel
            onViewJourney={(b) => setJourneyBook(b)}
            onDataChanged={fetchBooks}
            showToast={showToast}
          />
        ) : (
          <UserDashboard
            currentUser={currentUser}
            onViewJourney={(b) => setJourneyBook(b)}
            onRelistBook={handleRelistBook}
            onRequestBook={handleRequestBook}
            onCancelRequest={handleCancelRequest}
            onOpenPayment={(b) => setPaymentBook(b)}
            onOpenListModal={handleOpenListModal}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 13, 22, 0.95)',
        padding: '2rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#94a3b8'
        }}>
          <div>
            <span style={{ fontWeight: '700', color: '#f8fafc' }}>BookChain</span> • 24CIE554 Full Stack Development
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Designed & Built by Ashwath G Hegde (1MS25CI404) & Maulik Tondwal (1MS24CI070)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <button
              onClick={() => setIsSynopsisModalOpen(true)}
              style={{ color: '#818cf8', fontSize: '0.82rem' }}
            >
              View System Synopsis
            </button>
            <button
              onClick={handleResetFilters}
              style={{ color: '#94a3b8', fontSize: '0.82rem' }}
            >
              Catalogue
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {journeyBook && (
        <BookJourneyModal
          book={journeyBook}
          onClose={() => setJourneyBook(null)}
        />
      )}

      {claimBook && (
        <ClaimModal
          book={claimBook}
          currentUser={currentUser}
          onClose={() => setClaimBook(null)}
          onClaimSuccess={handleClaimSuccess}
        />
      )}

      {isListModalOpen && (
        <ListBookModal
          currentUser={currentUser}
          onClose={() => setIsListModalOpen(false)}
          onBookListed={handleBookListed}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          demoUsers={demoUsers}
          onQuickSwitch={handleQuickSwitch}
        />
      )}

      {paymentBook && (
        <PaymentGatewayModal
          book={paymentBook}
          onClose={() => setPaymentBook(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      <SynopsisModal
        isOpen={isSynopsisModalOpen}
        onClose={() => setIsSynopsisModalOpen(false)}
      />
    </div>
  );
}
