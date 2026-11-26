import React from 'react';
import { X, Award, CheckCircle2, Layers, Database, Server, Smartphone, BookOpen } from 'lucide-react';

export default function SynopsisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '2rem' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.05em' }}>
                24CIE554 • FULL STACK DEVELOPMENT
              </div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Project Synopsis & Architecture</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Student Details Card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Project Students
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Ashwath G Hegde</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>USN: 1MS25CI404</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Maulik Tondwal</div>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>USN: 1MS24CI070</div>
            </div>
          </div>
        </div>

        {/* Architecture Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Three-Tier Full Stack Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <Smartphone size={20} color="#38bdf8" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Presentation Layer</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>React.js SPA with hooks, responsive design tokens, and real-time state.</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <Server size={20} color="#818cf8" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Application Layer</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Node.js & Express RESTful API, JWT auth, bcrypt hashing, and claim validator.</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <Database size={20} color="#10b981" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>Data Layer</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>MongoDB collections for Users, Books, and Ownership History records.</div>
            </div>
          </div>
        </div>

        {/* 5 Core Modules Checklist */}
        <div>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            Mandatory Core Modules Implemented
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Module 1: Academic Authentication Module</strong> – Student registration & login with Name, USN (University Seat Number), Date of Birth (DOB), dynamic SVG Security CAPTCHA verification, bcrypt hashing, and JWT session handling.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Module 2: Book Listing Module</strong> – Creation, editing, dynamic search & filtering by subject, semester, and condition.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#10b981' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Module 3: Claim and Ownership Module</strong> – Multi-party validation (book available, claimant not owner), atomic state updates.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Module 4: Book Journey Module (Hero)</strong> – Chronological visual timeline of past owners, condition logs, and peer exam reviews.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="#10b981" />
              <span><strong>Module 5: User Dashboard Module</strong> – Aggregated view of books currently owned, listed, and passed forward down the chain.</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
