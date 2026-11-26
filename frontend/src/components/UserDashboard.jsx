import React, { useState, useEffect } from 'react';
import { BookOpen, History, Layers, ArrowUpRight, ArrowDownLeft, Sparkles, RefreshCw, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import BookCard from './BookCard';

export default function UserDashboard({
  currentUser,
  onViewJourney,
  onRelistBook,
  onRequestBook,
  onCancelRequest,
  onOpenPayment,
  onOpenListModal,
  onOpenAuth
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('owned');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [currentUser]);

  const fetchDashboard = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to load dashboard');
      }
    } catch (err) {
      setError('Error fetching dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '5rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: '#818cf8'
        }}>
          <Shield size={28} />
        </div>
        <h3 style={{ color: '#ffffff', fontSize: '1.35rem', marginBottom: '0.6rem', fontWeight: '700' }}>
          Student Authentication Required
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Please sign in using your <strong>Student Name</strong>, <strong>USN</strong>, <strong>Date of Birth (DOB)</strong> and <strong>CAPTCHA</strong> to view your active book holdings, claims, and handover activities.
        </p>
        <button
          onClick={onOpenAuth}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.92rem' }}
        >
          Sign In / Authenticate Student
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Student Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c7d2fe'
          }}>
            <UserCheck size={32} color="#818cf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                {currentUser.name}
              </h2>
              <span className="badge-usn" style={{ fontSize: '0.75rem' }}>
                {currentUser.usn}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {currentUser.department} • <span style={{ color: '#c7d2fe' }}>{currentUser.semester}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <span>Email: <span style={{ color: '#cbd5e1' }}>{currentUser.email}</span></span>
              {currentUser.dob && <span>• DOB: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{currentUser.dob}</strong></span>}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenListModal}
          className="btn-primary"
          style={{ fontSize: '0.9rem' }}
        >
          <BookOpen size={18} />
          <span>List Another Book</span>
        </button>
      </div>

      {/* Aggregate Metric Tiles */}
      {dashboardData && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#67e8f9', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Currently Owned
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.2rem' }}>
              {dashboardData.stats.totalOwned}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Books in your custody</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Original Listings
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#818cf8', marginTop: '0.2rem' }}>
              {dashboardData.stats.totalListed}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Introduced into system</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Passed Forward
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
              {dashboardData.stats.totalGivenAway}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Passed to juniors / peers</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              Chain Interactions
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#fb7185', marginTop: '0.2rem' }}>
              {dashboardData.stats.totalExchangesParticipated}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total chain transactions</div>
          </div>
        </div>
      )}

      {/* Sub Tabs Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.75rem',
        marginBottom: '1.75rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveSubTab('owned')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeSubTab === 'owned' ? '#ffffff' : '#94a3b8',
            background: activeSubTab === 'owned' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeSubTab === 'owned' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          Books in My Possession ({dashboardData?.ownedBooks?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('listed')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeSubTab === 'listed' ? '#ffffff' : '#94a3b8',
            background: activeSubTab === 'listed' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeSubTab === 'listed' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          Originally Listed by Me ({dashboardData?.listedBooks?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('passed')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeSubTab === 'passed' ? '#ffffff' : '#94a3b8',
            background: activeSubTab === 'passed' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeSubTab === 'passed' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          Passed Down the Chain ({dashboardData?.givenAwayBooks?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: activeSubTab === 'activity' ? '#ffffff' : '#94a3b8',
            background: activeSubTab === 'activity' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeSubTab === 'activity' ? '1px solid rgba(99, 102, 241, 0.4)' : 'none'
          }}
        >
          My Transfer Audit Log ({dashboardData?.activityHistory?.length || 0})
        </button>
      </div>

      {/* Sub Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
          Loading dashboard collections...
        </div>
      ) : activeSubTab === 'owned' ? (
        <div>
          {dashboardData?.ownedBooks?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              You do not currently hold any books. Browse the catalogue and claim one!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData.ownedBooks.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  currentUser={currentUser}
                  onViewJourney={onViewJourney}
                  onRelistBook={onRelistBook}
                  onRequestBook={onRequestBook}
                  onCancelRequest={onCancelRequest}
                  onOpenPayment={onOpenPayment}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'listed' ? (
        <div>
          {dashboardData?.listedBooks?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              You haven't listed any books yet. Click "List a Book" to contribute to the chain!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData.listedBooks.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  currentUser={currentUser}
                  onViewJourney={onViewJourney}
                  onRelistBook={onRelistBook}
                  onRequestBook={onRequestBook}
                  onCancelRequest={onCancelRequest}
                  onOpenPayment={onOpenPayment}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeSubTab === 'passed' ? (
        <div>
          {dashboardData?.givenAwayBooks?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No books passed down yet. When you transfer an owned book to a peer, it appears here!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData.givenAwayBooks.map(book => (
                <BookCard
                  key={book._id}
                  book={book}
                  currentUser={currentUser}
                  onViewJourney={onViewJourney}
                  onRelistBook={onRelistBook}
                  onRequestBook={onRequestBook}
                  onCancelRequest={onCancelRequest}
                  onOpenPayment={onOpenPayment}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Activity Transfer Audit Table */
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Transaction ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Peer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Condition</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Handover Location</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.activityHistory?.map(act => {
                const isReceiver = act.newOwner?._id === currentUser._id;
                return (
                  <tr key={act._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#818cf8' }}>
                      {act.transactionHash}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {isReceiver ? (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                          <ArrowDownLeft size={14} /> Received
                        </span>
                      ) : (
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }}>
                          <ArrowUpRight size={14} /> Transferred
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {isReceiver ? (
                        act.previousOwner ? `${act.previousOwner.name} (${act.previousOwner.usn})` : 'Genesis Listing'
                      ) : (
                        `${act.newOwner?.name} (${act.newOwner?.usn})`
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#38bdf8' }}>
                      {act.conditionAtTransfer}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      {new Date(act.transferDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                      {act.location}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
