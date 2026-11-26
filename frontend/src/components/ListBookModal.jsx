import React, { useState } from 'react';
import { X, BookPlus, Sparkles, Image, Tag, AlertCircle } from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Algorithms / CS Tech', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=800' },
  { label: 'Database & Systems', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800' },
  { label: 'Operating Systems', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800' },
  { label: 'AI & Machine Learning', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800' },
  { label: 'Engineering Math', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800' },
  { label: 'Electronics & Circuits', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
  { label: 'Engineering Physics', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800' }
];

export default function ListBookModal({
  currentUser,
  onClose,
  onBookListed
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Computer Science');
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('24CIE554');
  const [edition, setEdition] = useState('Latest Edition');
  const [condition, setCondition] = useState('Good (Light Notes)');
  const [exchangeType, setExchangeType] = useState('Free Donation');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [description, setDescription] = useState('');
  const [currentOwnerNotes, setCurrentOwnerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          title,
          author,
          genre,
          subject: subject || 'Core Engineering Course',
          courseCode: courseCode || '24CIE554',
          edition,
          condition,
          exchangeType,
          coverImage,
          description,
          currentOwnerNotes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to list book');
      }

      onBookListed(data.data);
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
        style={{ maxWidth: '640px', padding: '1.75rem' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookPlus size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>List Book for Exchange</h2>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Listing as: <span style={{ color: '#38bdf8' }}>{currentUser?.name} ({currentUser?.usn})</span>
              </div>
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
          {/* Row 1: Title and Author */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Book Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Design and Analysis of Algorithms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Author(s) *
              </label>
              <input
                type="text"
                placeholder="e.g. Cormen, Leiserson"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Row 2: Genre, Course Code & Subject */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Academic Branch / Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Electronics">Electronics</option>
                <option value="Physics">Physics</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. 24CIE554"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Pristine / Like New">Pristine / Like New</option>
                <option value="Good (Light Notes)">Good (Light Notes)</option>
                <option value="Fair (Readable)">Fair (Readable)</option>
                <option value="Worn (Usable)">Worn (Usable)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Cover Preset Picker */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              Choose Textbook Cover
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {COVER_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCoverImage(p.url)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    background: coverImage === p.url ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: coverImage === p.url ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: coverImage === p.url ? '#c7d2fe' : '#94a3b8'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Notes for Junior & Syllabus tips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              Handover Advice & Notes for Junior
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Great for Module 3 and 4; has highlighted notes on shortest path algorithms."
              value={currentOwnerNotes}
              onChange={(e) => setCurrentOwnerNotes(e.target.value)}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Action buttons */}
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
              {submitting ? 'Registering on Chain...' : 'Register Book on Exchange Chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
