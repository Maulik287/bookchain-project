import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, MapPin, CheckCircle, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimModal({
  book,
  currentUser,
  onClose,
  onClaimSuccess
}) {
  const [location, setLocation] = useState('Central Library 2nd Floor');
  const [semesterUsed, setSemesterUsed] = useState(currentUser?.semester || '4th Semester');
  const [conditionAtTransfer, setConditionAtTransfer] = useState(book?.condition || 'Good (Light Notes)');
  const [studentFeedback, setStudentFeedback] = useState('Claiming for semester exam revision and lab practicals.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!book || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/claims/${book._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          location,
          academicSemesterUsed: semesterUsed,
          currentCondition: conditionAtTransfer,
          studentFeedback,
          notes: `Handover arranged at ${location} for ${semesterUsed}.`
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to claim book');
      }

      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClaimSuccess(data.data.book);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span className="badge badge-available" style={{ marginBottom: '0.35rem' }}>
              Peer Transfer Protocol
            </span>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>
              Claim Academic Textbook
            </h2>
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

        {/* Handover Visual Transfer Summary */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.4rem' }}>
            {book.title}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            Course: <strong style={{ color: '#38bdf8' }}>{book.courseCode}</strong> • Author: {book.author}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Current Owner</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1' }}>
                {book.currentOwner?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                {book.currentOwner?.usn}
              </div>
            </div>

            <ArrowRight size={20} color="#818cf8" />

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Claimant (You)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', fontFamily: 'monospace' }}>
                {currentUser.usn}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Exchange Handover Spot
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Central Library 2nd Floor">Central Library 2nd Floor</option>
                <option value="CSE Department Room 304">CSE Department Room 304</option>
                <option value="Student Activity Canteen">Student Activity Canteen</option>
                <option value="Campus Quadrangle Benches">Campus Quadrangle Benches</option>
                <option value="Main College Gate">Main College Gate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Semester You Are Studying
              </label>
              <input
                type="text"
                value={semesterUsed}
                onChange={(e) => setSemesterUsed(e.target.value)}
                placeholder="e.g. 4th Semester"
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              Acceptance Condition Log
            </label>
            <select
              value={conditionAtTransfer}
              onChange={(e) => setConditionAtTransfer(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Pristine / Like New">Pristine / Like New</option>
              <option value="Good (Light Notes)">Good (Light Notes)</option>
              <option value="Fair (Readable)">Fair (Readable)</option>
              <option value="Worn (Usable)">Worn (Usable)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              Academic Notes / Peer Review for Chain Log
            </label>
            <textarea
              rows="3"
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              placeholder="e.g. Taking this book for CIE internal exams, promising to return in mint condition."
              required
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Confirming Transfer...' : 'Confirm Claim & Record Chain Hop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
