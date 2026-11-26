import React from 'react';
import { Search, Filter, BookOpen, Layers, ShieldCheck, Sparkles, RefreshCw, X, BookMarked, CheckCircle2 } from 'lucide-react';

export default function Hero({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedCondition,
  setSelectedCondition,
  selectedStatus,
  setSelectedStatus,
  onResetFilters,
  booksCount
}) {
  const genres = ['All', 'Computer Science', 'Mathematics', 'Electronics', 'Physics'];

  return (
    <div style={{
      padding: '2.5rem 1.5rem 1.5rem 1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Synopsis Banner Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.85rem',
        background: 'rgba(99, 102, 241, 0.12)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '999px',
        fontSize: '0.8rem',
        color: '#c7d2fe',
        marginBottom: '1.25rem',
        backdropFilter: 'blur(8px)'
      }}>
        <Sparkles size={14} color="#818cf8" />
        <span>Course 24CIE554 • Full Stack Development Project</span>
        <span style={{ color: '#475569' }}>|</span>
        <span style={{ color: '#38bdf8', fontWeight: '600' }}>MERN Stack with Ownership Provenance</span>
      </div>

      {/* Hero Headline */}
      <div style={{ maxWidth: '850px', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          lineHeight: '1.15',
          marginBottom: '1rem',
          letterSpacing: '-0.03em'
        }}>
          Second-Hand Book Exchange with <br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Verifiable Ownership History
          </span>
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#94a3b8',
          lineHeight: '1.6',
          maxWidth: '750px'
        }}>
          Transforming informal noticeboard swaps into a transparent peer-to-peer network. Every textbook maintains a permanent chronological paper trail of student owners, condition logs, and academic notes.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            flexShrink: 0
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.15rem' }}>
              Full Ownership Chain
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Track past owners, dates & condition reviews
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.15rem' }}>
              USN Verified Students
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Peer-to-peer exchange within college community
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            flexShrink: 0
          }}>
            <RefreshCw size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', marginBottom: '0.15rem' }}>
              Zero-Waste Re-listing
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Pass books forward once semester exams end
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 29, 47, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.35rem',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.1)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            flex: '1 1 320px'
          }}>
            <Search
              size={18}
              color="#818cf8"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />
            <input
              type="text"
              placeholder="Search by book title, author, or subject (e.g. DAA, Algorithms, DBMS, VLSI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.6rem',
                paddingRight: searchQuery ? '2.4rem' : '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(10, 15, 29, 0.9)',
                borderColor: searchQuery ? '#818cf8' : 'rgba(255, 255, 255, 0.12)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Selects */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <option value="All">All Conditions</option>
              <option value="Pristine">Pristine / Like New</option>
              <option value="Good">Good (Light Notes)</option>
              <option value="Fair">Fair (Readable)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <option value="All">All Availability</option>
              <option value="Available">Available Only</option>
              <option value="Claimed">Claimed / In Use</option>
            </select>

            {(searchQuery || selectedGenre !== 'All' || selectedCondition !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={onResetFilters}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.6rem 0.85rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Genre Pill Selection */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '0.25rem', fontWeight: '600' }}>
            Category:
          </span>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: selectedGenre === g ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedGenre === g ? '#ffffff' : '#94a3b8',
                border: selectedGenre === g ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              {g}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
            Showing <strong>{booksCount}</strong> academic books
          </span>
        </div>
      </div>
    </div>
  );
}
