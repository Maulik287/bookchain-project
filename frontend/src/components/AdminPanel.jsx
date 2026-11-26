import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BookOpen,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  Trash2,
  RotateCcw,
  ListOrdered,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  History
} from 'lucide-react';

export default function AdminPanel({ onViewJourney, onDataChanged, showToast }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('books'); // 'books' | 'overdue' | 'queues' | 'payments' | 'users'
  const [busyId, setBusyId] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      } else {
        showToast?.(data.message || 'Failed to load Admin Panel', 'error');
      }
    } catch (err) {
      showToast?.('Error loading Admin Panel: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const runAdminAction = async (url, method = 'POST', body = null, id = null) => {
    try {
      setBusyId(id);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (data.success) {
        showToast?.(data.message || 'Action completed');
        await fetchOverview();
        onDataChanged?.();
      } else {
        showToast?.(data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showToast?.('Admin action failed: ' + err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !overview) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        Loading Admin Panel...
      </div>
    );
  }

  const stats = overview?.stats || {};
  const books = overview?.books || [];
  const users = overview?.users || [];
  const payments = overview?.payments || [];
  const overdueBooks = books.filter((b) => b.loanInfo?.isOverdue);
  const queuedBooks = books.filter((b) => b.requestQueue && b.requestQueue.length > 0);

  return (
    <div style={{ maxWidth: '1220px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(15, 23, 42, 0.92) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.45rem', color: '#ffffff', margin: 0, fontWeight: '800' }}>
                BookChain Admin Panel
              </h2>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}>
                NO-USN ADMIN ACCESS
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Monitor Book DB, 15-day circulation limits, +₹5/day penalties, FCFS queues & payment gateway logs.
            </div>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {[
          { label: 'Total Book DB', val: stats.totalBooks || 0, sub: `${stats.availableBooks || 0} Available • ${stats.claimedBooks || 0} Claimed`, color: '#38bdf8' },
          { label: 'Overdue Books', val: stats.overdueBooks || 0, sub: 'Exceeded 15-day limit', color: '#fb7185' },
          { label: 'Pending Penalties', val: `₹${stats.totalPendingPenalties || 0}`, sub: '₹5/day late accrual', color: '#f59e0b' },
          { label: 'Collected via Gateway', val: `₹${stats.totalCollectedPenalties || 0}`, sub: `${stats.totalTransactions || 0} settled txns`, color: '#34d399' },
          { label: 'FCFS Queue Requests', val: stats.totalQueuedRequests || 0, sub: 'Active waitlist entries', color: '#a78bfa' },
          { label: 'Registered Students', val: stats.totalUsers || 0, sub: 'Active peer accounts', color: '#818cf8' }
        ].map((tile) => (
          <div
            key={tile.label}
            style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
              {tile.label}
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: tile.color, margin: '0.2rem 0' }}>
              {tile.val}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tile.sub}</div>
          </div>
        ))}
      </div>

      {/* Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'books', label: `Book DB (${books.length})`, icon: BookOpen },
          { id: 'overdue', label: `Overdue & Penalties (${overdueBooks.length})`, icon: AlertTriangle },
          { id: 'queues', label: `FCFS Request Queues (${queuedBooks.length})`, icon: ListOrdered },
          { id: 'payments', label: `Payment Gateway Logs (${payments.length})`, icon: CreditCard },
          { id: 'users', label: `Users (${users.length})`, icon: Users }
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: active ? '#ffffff' : '#94a3b8',
                background: active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                border: active ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer'
              }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Book DB & Circulation */}
      {subTab === 'books' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Book Title</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Current Holder</th>
                <th style={{ padding: '0.85rem 1rem' }}>15-Day Timer / Penalty</th>
                <th style={{ padding: '0.85rem 1rem' }}>FCFS Queue</th>
                <th style={{ padding: '0.85rem 1rem' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => {
                const loan = b.loanInfo || {};
                return (
                  <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#f8fafc' }}>{b.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.courseCode} • {b.totalHops || 1} hops</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${b.status === 'Available' ? 'badge-available' : 'badge-claimed'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{b.currentOwner?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>{b.currentOwner?.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {b.status === 'Claimed' ? (
                        loan.isOverdue ? (
                          <span style={{ color: '#fb7185', fontWeight: '700' }}>
                            Overdue {loan.overdueDays}d (₹{loan.penaltyAmount})
                          </span>
                        ) : loan.penaltyPaid ? (
                          <span style={{ color: '#34d399', fontWeight: '600' }}>Penalty Settled</span>
                        ) : (
                          <span style={{ color: '#38bdf8' }}>{loan.daysRemaining}d left of 15d</span>
                        )
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#c7d2fe' }}>
                      {b.requestQueue?.length || 0} waiting
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onViewJourney(b)}
                          title="View Ownership Journey"
                          style={{
                            padding: '0.3rem 0.55rem',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                            color: '#a5b4fc',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <History size={12} /> Journey
                        </button>
                        {b.status === 'Claimed' && !loan.isOverdue && (
                          <button
                            disabled={busyId === b._id}
                            onClick={() => runAdminAction(`/api/admin/books/${b._id}/simulate-overdue`, 'POST', { daysAgo: 19 }, b._id)}
                            title="Simulate 19 days held (4d overdue = ₹20 penalty) for testing"
                            style={{
                              padding: '0.3rem 0.55rem',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.35)',
                              color: '#fbbf24',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            +Test Overdue
                          </button>
                        )}
                        {loan.isOverdue && (
                          <button
                            disabled={busyId === b._id}
                            onClick={() => runAdminAction(`/api/admin/books/${b._id}/waive-penalty`, 'POST', null, b._id)}
                            style={{
                              padding: '0.3rem 0.55rem',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              color: '#34d399',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Waive ₹{loan.penaltyAmount}
                          </button>
                        )}
                        {b.status === 'Claimed' && (
                          <button
                            disabled={busyId === b._id}
                            onClick={() => runAdminAction(`/api/admin/books/${b._id}/force-relist`, 'POST', null, b._id)}
                            title="Force Return to Book DB"
                            style={{
                              padding: '0.3rem 0.55rem',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              color: '#38bdf8',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <RotateCcw size={11} /> Return
                          </button>
                        )}
                        <button
                          disabled={busyId === b._id}
                          onClick={() => {
                            if (window.confirm(`Delete '${b.title}' from Book DB?`)) {
                              runAdminAction(`/api/admin/books/${b._id}`, 'DELETE', null, b._id);
                            }
                          }}
                          title="Delete Book"
                          style={{
                            padding: '0.3rem 0.45rem',
                            borderRadius: '6px',
                            background: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            color: '#fb7185',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Overdue & Penalties */}
      {subTab === 'overdue' && (
        <div>
          {overdueBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', color: '#34d399' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '0.6rem' }} />
              <div style={{ fontWeight: '700' }}>All books are within the 15-day time limit!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {overdueBooks.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '1.15rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>{b.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      Holder: <strong>{b.currentOwner?.name}</strong> ({b.currentOwner?.email})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#fda4af', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> Held {b.loanInfo.daysHeld} days (Limit: 15 days)</span>
                      <span>Overdue: <strong>{b.loanInfo.overdueDays} day(s)</strong></span>
                      <span>Penalty (+₹5/day): <strong>₹{b.loanInfo.penaltyAmount}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={() => runAdminAction(`/api/admin/books/${b._id}/waive-penalty`, 'POST', null, b._id)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    >
                      Waive ₹{b.loanInfo.penaltyAmount} Penalty
                    </button>
                    <button
                      onClick={() => runAdminAction(`/api/admin/books/${b._id}/force-relist`, 'POST', null, b._id)}
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}
                    >
                      Force Return to Book DB
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: FCFS Request Queues */}
      {subTab === 'queues' && (
        <div>
          {queuedBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', color: '#94a3b8' }}>
              No active FCFS waitlist requests right now.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {queuedBooks.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    padding: '1.15rem 1.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '1rem' }}>{b.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Currently Held By: <strong style={{ color: '#e2e8f0' }}>{b.currentOwner?.name}</strong>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#a78bfa',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px'
                    }}>
                      First Come First Serve ({b.requestQueue.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {b.requestQueue.map((req) => (
                      <div
                        key={req.userId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(9, 13, 22, 0.7)',
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          border: req.position === 1 ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255,255,255,0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            color: req.position === 1 ? '#34d399' : '#818cf8',
                            fontFamily: 'monospace'
                          }}>
                            Req #{req.position}
                          </span>
                          <span style={{ color: '#f8fafc', fontWeight: '600', fontSize: '0.84rem' }}>{req.name}</span>
                          <span style={{ color: '#64748b', fontSize: '0.74rem', fontFamily: 'monospace' }}>{req.email}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: req.position === 1 ? '#34d399' : '#94a3b8' }}>
                          {req.position === 1 ? 'Next in Line (Priority)' : 'Waiting'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Payment Gateway Logs */}
      {subTab === 'payments' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No penalty payments processed through the Payment Gateway yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Transaction ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Student</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Book</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Overdue Days</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: '700' }}>{p.txnId}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#f8fafc' }}>{p.userName}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{p.bookTitle}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#fda4af' }}>{p.overdueDays}d × ₹5</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: '800' }}>₹{p.amount}.00</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{p.method} ({p.paymentRef})</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{new Date(p.paidAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: Users */}
      {subTab === 'users' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Semester</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#f8fafc' }}>{u.name}</td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#38bdf8' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: u.role === 'admin' ? '#fbbf24' : '#a5b4fc'
                    }}>
                      {u.role === 'admin' ? 'ADMIN' : 'STUDENT'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{u.department}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{u.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
