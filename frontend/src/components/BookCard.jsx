import React from 'react';
import {
  History,
  User,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  BookMarked,
  Clock,
  AlertTriangle,
  ListOrdered,
  CreditCard,
  CheckCircle2,
  UserPlus,
  XCircle
} from 'lucide-react';

export default function BookCard({
  book,
  currentUser,
  onViewJourney,
  onClaimBook,
  onRelistBook,
  onRequestBook,
  onCancelRequest,
  onOpenPayment
}) {
  const isOwner = currentUser && book.currentOwner && currentUser._id === book.currentOwner._id;
  const isAvailable = book.status === 'Available';
  const loan = book.loanInfo || {};
  const queue = Array.isArray(book.requestQueue) ? book.requestQueue : [];
  const myQueueEntry = currentUser ? queue.find((q) => q.userId === currentUser._id) : null;
  const firstInQueue = queue.length > 0 ? queue[0] : null;

  const getConditionColor = (cond) => {
    if (!cond) return '#94a3b8';
    if (cond.includes('Pristine')) return '#10b981';
    if (cond.includes('Good')) return '#38bdf8';
    if (cond.includes('Fair')) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative'
    }}>
      {/* Cover and Status Header */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#0b1120' }}>
        <img
          src={book.coverImage}
          alt={book.title}
          className="book-card-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.92)'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.35) 65%, transparent 100%)'
        }} />

        {/* Status Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className={`badge ${isAvailable ? 'badge-available' : 'badge-claimed'}`} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isAvailable ? '#10b981' : '#f59e0b',
              display: 'inline-block',
              boxShadow: isAvailable ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
            }} />
            {book.status}
          </span>
        </div>

        {/* Chain Hops Indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '999px',
          padding: '0.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.72rem',
          fontWeight: '700',
          color: '#c7d2fe',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
        }}>
          <History size={13} color="#818cf8" />
          <span>{book.totalHops || 1} {book.totalHops === 1 ? 'Owner' : 'Hops'} in Chain</span>
        </div>

        {/* Course Code & Genre Badge */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '12px',
          display: 'flex',
          gap: '0.45rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#38bdf8',
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '6px',
              padding: '0.15rem 0.5rem',
              fontFamily: 'monospace'
            }}>
              {book.courseCode || '24CIE554'}
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '600',
              color: '#cbd5e1',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {book.genre}
            </span>
          </div>

          <span style={{
            fontSize: '0.68rem',
            color: '#94a3b8',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px'
          }}>
            {book.edition || 'Latest'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Subject Highlight Header */}
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#818cf8',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <BookMarked size={13} color="#818cf8" />
          <span>{book.subject}</span>
        </div>

        <h3 style={{
          fontSize: '1.08rem',
          lineHeight: '1.35',
          marginBottom: '0.35rem',
          fontWeight: '700',
          color: '#ffffff'
        }}>
          {book.title}
        </h3>

        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
          by <span style={{ color: '#cbd5e1' }}>{book.author}</span>
        </div>

        {/* Condition Rating Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.78rem',
          marginBottom: '0.95rem'
        }}>
          <span style={{ color: '#64748b' }}>Condition:</span>
          <span style={{
            fontWeight: '600',
            color: getConditionColor(book.condition),
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            border: `1px solid ${getConditionColor(book.condition)}44`
          }}>
            {book.condition}
          </span>
        </div>

        {/* Current Owner Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.7rem 0.85rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1.5px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              flexShrink: 0
            }}>
              <User size={15} />
            </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f1f5f9' }}>
                  {book.currentOwner?.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                  {book.currentOwner?.email || book.currentOwner?.usn}
                </div>
              </div>
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'right', fontWeight: '500' }}>
            Current Holder
          </div>
        </div>

        {/* 15-Day Time Limit & +₹5/day Penalty Status */}
        {!isAvailable && loan.isClaimed && (
          <div style={{
            marginBottom: '0.85rem',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            background: loan.isOverdue
              ? 'rgba(244, 63, 94, 0.12)'
              : loan.penaltyPaid
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(56, 189, 248, 0.08)',
            border: loan.isOverdue
              ? '1px solid rgba(244, 63, 94, 0.35)'
              : loan.penaltyPaid
                ? '1px solid rgba(16, 185, 129, 0.35)'
                : '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '0.74rem'
          }}>
            {loan.isOverdue ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fb7185', fontWeight: '700' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={13} />
                    Overdue by {loan.overdueDays} day(s)
                  </span>
                  <span>Penalty: ₹{loan.penaltyAmount}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#fda4af' }}>
                  15-day limit exceeded (Held {loan.daysHeld}d • +₹5/day fine)
                </div>
              </div>
            ) : loan.penaltyPaid ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} />
                  Penalty Settled via Gateway
                </span>
                <span>Ready to Pass On</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} />
                  15-Day Limit: {loan.daysRemaining}d left
                </span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Held {loan.daysHeld}/15d</span>
              </div>
            )}
          </div>
        )}

        {/* FCFS Request Queue (Requested by person: Req 1, Req 2) */}
        {!isAvailable && queue.length > 0 && (
          <div style={{
            marginBottom: '0.9rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            fontSize: '0.72rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#c4b5fd',
              fontWeight: '700',
              marginBottom: '0.3rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ListOrdered size={12} />
                Requested Queue (FCFS)
              </span>
              <span>{queue.length} waiting</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem', color: '#cbd5e1' }}>
              {queue.slice(0, 3).map((q) => (
                <div key={q.userId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>
                    <strong style={{ color: q.position === 1 ? '#34d399' : '#a78bfa' }}>Req #{q.position}:</strong> {q.name}
                  </span>
                  {q.position === 1 && <span style={{ color: '#34d399', fontWeight: '600' }}>Next</span>}
                </div>
              ))}
              {queue.length > 3 && (
                <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>+{queue.length - 3} more in queue</div>
              )}
            </div>
          </div>
        )}

        {/* Owner Note Snippet */}
        {book.currentOwnerNotes && (
          <div style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontStyle: 'italic',
            marginBottom: '1.15rem',
            background: 'rgba(99, 102, 241, 0.06)',
            borderLeft: '2.5px solid #818cf8',
            padding: '0.45rem 0.7rem',
            borderRadius: '0 6px 6px 0',
            lineHeight: '1.4'
          }}>
            "{book.currentOwnerNotes.length > 80 ? book.currentOwnerNotes.substring(0, 80) + '...' : book.currentOwnerNotes}"
          </div>
        )}

        {/* Card Actions Footer */}
        <div style={{
          marginTop: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem'
        }}>
          {/* View Journey Timeline Button */}
          <button
            onClick={() => onViewJourney(book)}
            className="btn-outline-primary"
            style={{
              justifyContent: 'center',
              fontSize: '0.82rem',
              padding: '0.6rem 0.5rem',
              borderRadius: '8px'
            }}
          >
            <History size={15} />
            <span>View Journey</span>
          </button>

          {/* Claim or Re-list Button */}
          {isOwner ? (
            isAvailable ? (
              <div style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                <BookmarkCheck size={14} style={{ marginRight: '4px' }} />
                Your Listing
              </div>
            ) : loan.isOverdue && loan.penaltyAmount > 0 ? (
              <button
                onClick={() => onOpenPayment && onOpenPayment(book)}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                }}
              >
                <CreditCard size={14} />
                <span>Pay ₹{loan.penaltyAmount} Fine</span>
              </button>
            ) : (
              <button
                onClick={() => onRelistBook(book)}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              >
                <Sparkles size={14} />
                <span>{firstInQueue ? `Pass to #1 ${firstInQueue.name.split(' ')[0]}` : 'Pass It On'}</span>
              </button>
            )
          ) : (
            isAvailable ? (
              <button
                onClick={() => onClaimBook(book)}
                className="btn-primary"
                style={{
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '8px'
                }}
              >
                <span>Claim Book</span>
                <ArrowRight size={14} />
              </button>
            ) : myQueueEntry ? (
              <button
                onClick={() => onCancelRequest && onCancelRequest(book)}
                style={{
                  background: 'rgba(139, 92, 246, 0.16)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '0.55rem 0.45rem'
                }}
              >
                <XCircle size={13} />
                <span>Req #{myQueueEntry.position} • Leave</span>
              </button>
            ) : (
              <button
                onClick={() => onRequestBook && onRequestBook(book)}
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                  color: '#e0e7ff',
                  border: '1px solid rgba(139, 92, 246, 0.45)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '0.55rem 0.45rem'
                }}
              >
                <UserPlus size={13} />
                <span>Request (FCFS)</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
