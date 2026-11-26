import React, { useState, useEffect } from 'react';
import { X, History, MapPin, Calendar, ShieldCheck, ArrowRight, UserCheck, User, CheckCircle2, MessageSquare, BookOpen, Hash } from 'lucide-react';

export default function BookJourneyModal({ book, onClose }) {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book) return;

    const fetchJourney = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/journey/${book._id}`);
        const data = await res.json();
        if (data.success) {
          setJourneyData(data.data);
        } else {
          setError(data.message || 'Failed to load journey');
        }
      } catch (err) {
        setError('Error connecting to backend: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [book]);

  if (!book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: '1.75rem' }}
      >
        {/* Modal Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)'
            }}>
              <History size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.2rem'
              }}>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  Provenance Chain
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ShieldCheck size={14} /> 100% Cryptographically Verified
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff', lineHeight: '1.2' }}>
                {book.title}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                by {book.author} • Course: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{book.courseCode}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Chain Summary Cards */}
        {journeyData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.75rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Chain Length
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#818cf8' }}>
                {journeyData.chainLength} Student Hops
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Genesis Registered
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#e2e8f0' }}>
                {new Date(journeyData.genesisDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Current Custodian
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#38bdf8' }}>
                {book.currentOwner?.name} ({book.currentOwner?.usn})
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
              <History size={28} color="#818cf8" />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Querying BookChain timeline history...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {/* Timeline Visualization */}
        {journeyData && journeyData.history && (
          <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
            {/* Continuous Vertical Chain Line */}
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '15px',
              bottom: '25px',
              width: '3px',
              background: 'linear-gradient(to bottom, #6366f1, #8b5cf6, #10b981)',
              borderRadius: '2px'
            }} />

            {journeyData.history.map((record, index) => {
              const isGenesis = index === 0;
              const isLatest = index === journeyData.history.length - 1;

              return (
                <div 
                  key={record._id || index}
                  style={{
                    position: 'relative',
                    marginBottom: '1.75rem'
                  }}
                >
                  {/* Timeline Node Bullet */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.75rem',
                    top: '4px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isGenesis 
                      ? '#6366f1' 
                      : isLatest 
                        ? '#10b981' 
                        : '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                    border: '3px solid #0f1627',
                    zIndex: 2
                  }}>
                    {isGenesis ? (
                      <BookOpen size={12} color="#ffffff" />
                    ) : (
                      <CheckCircle2 size={12} color="#ffffff" />
                    )}
                  </div>

                  {/* Card for this Event */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: isLatest 
                      ? '1px solid rgba(16, 185, 129, 0.35)' 
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem 1.25rem',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)'
                  }}>
                    {/* Header Row: Previous -> New & Date */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {record.previousOwner ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.2)',
                                border: '1px solid #6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#818cf8',
                                flexShrink: 0
                              }}>
                                <User size={12} />
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1' }}>
                                {record.previousOwner.name}
                              </span>
                              <span className="badge-usn" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                                {record.previousOwner.usn}
                              </span>
                            </div>
                            <ArrowRight size={14} color="#818cf8" />
                          </>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#818cf8',
                            background: 'rgba(99, 102, 241, 0.15)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px'
                          }}>
                            ★ GENESIS LISTING
                          </span>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.25)',
                            border: '1px solid #6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#a5b4fc',
                            flexShrink: 0
                          }}>
                            <User size={12} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                            {record.newOwner?.name}
                          </span>
                          <span className="badge-usn" style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem' }}>
                            {record.newOwner?.usn}
                          </span>
                        </div>
                      </div>

                      {/* Date & Proof Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Calendar size={13} />
                          {new Date(record.transferDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.68rem',
                          color: '#64748b',
                          background: 'rgba(0,0,0,0.3)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {record.transactionHash}
                        </span>
                      </div>
                    </div>

                    {/* Condition & Semester Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      marginBottom: '0.65rem'
                    }}>
                      <span>
                        Condition Logged: <strong style={{ color: '#38bdf8' }}>{record.conditionAtTransfer}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Semester Used: <strong style={{ color: '#e2e8f0' }}>{record.academicSemesterUsed}</strong>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} color="#f59e0b" />
                        {record.location}
                      </span>
                    </div>

                    {/* Handwritten Style Student Feedback Note */}
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.06)',
                      borderLeft: '3px solid #6366f1',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.82rem',
                      color: '#cbd5e1'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#818cf8', fontSize: '0.72rem', fontWeight: '700', marginBottom: '0.2rem' }}>
                        <MessageSquare size={12} />
                        STUDENT NOTES & EXAM TIPS:
                      </div>
                      "{record.studentFeedback || record.notes}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Audited by Course 24CIE554 Ownership Chain Protocol
          </span>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            Close Journey
          </button>
        </div>
      </div>
    </div>
  );
}
