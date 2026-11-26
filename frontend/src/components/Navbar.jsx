import React from 'react';
import { BookOpen, Link as LinkIcon, PlusCircle, User, LogOut, Award, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  demoUsers,
  onSwitchUser,
  onOpenAuth,
  onLogout,
  onOpenListModal,
  onOpenSynopsis
}) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveTab('catalogue')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)'
        }}>
          <LinkIcon size={22} color="#ffffff" strokeWidth={2.4} />
        </div>
        <div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            BookChain
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              padding: '0.15rem 0.45rem',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              borderRadius: '999px',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              letterSpacing: '0.05em'
            }}>MERN</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Academic Peer-to-Peer Ownership Chain
          </div>
        </div>
      </div>

      {/* Center Navigation Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '0.35rem 0.5rem',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          onClick={() => setActiveTab('catalogue')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeTab === 'catalogue' ? '#ffffff' : '#94a3b8',
            background: activeTab === 'catalogue' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTab === 'catalogue' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none'
          }}
        >
          Book Catalogue
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeTab === 'dashboard' ? '#ffffff' : '#94a3b8',
            background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: activeTab === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.5)' : 'none'
          }}
        >
          My Dashboard
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: activeTab === 'admin' ? '#ffffff' : '#fbbf24',
              background: activeTab === 'admin' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.1)',
              border: activeTab === 'admin' ? '1px solid rgba(245, 158, 11, 0.65)' : '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <ShieldCheck size={14} />
            Admin Panel
          </button>
        )}

        <button
          onClick={onOpenSynopsis}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Award size={14} />
          Synopsis (24CIE554)
        </button>
      </div>

      {/* Right Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {/* List a Book CTA */}
        <button
          onClick={onOpenListModal}
          className="btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
        >
          <PlusCircle size={16} />
          <span>List a Book</span>
        </button>

        {/* User Profile Pill */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              onClick={onOpenAuth}
              title="Click to view/switch student credentials"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.3rem 0.7rem 0.3rem 0.4rem',
                borderRadius: '999px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1.5px solid #6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a5b4fc'
              }}>
                <User size={16} color="#818cf8" />
              </div>
              <div style={{ lineHeight: '1.1' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f8fafc' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: currentUser.role === 'admin' ? '#fbbf24' : '#38bdf8', fontFamily: 'monospace' }}>
                  {currentUser.role === 'admin' ? 'ADMIN PANEL' : currentUser.email}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out / Log Out"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#fca5a5',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShieldCheck size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
