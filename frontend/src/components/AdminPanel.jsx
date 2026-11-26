import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  Trash2,
  RotateCcw,
  ListOrdered,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  History,
  BarChart3,
  BookCheck,
  UserX,
  Phone,
  Mail
} from 'lucide-react';

export default function AdminPanel({ onViewJourney, onDataChanged, showToast }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'available' | 'allotted' | 'pending' | 'defaulters' | 'payments' | 'users'
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
        Loading Library Incharge Analytics Panel...
      </div>
    );
  }

  const stats = overview?.stats || {};
  const analytics = overview?.analytics || {};
  const books = overview?.books || [];
  const users = overview?.users || [];
  const payments = overview?.payments || [];

  const availableBooks = analytics.availableBooks || books.filter((b) => b.status === 'Available');
  const allottedBooks = analytics.allottedBooks || books.filter((b) => b.status === 'Claimed');
  const pendingRequests = analytics.pendingRequests || [];
  const notSubmittedBooks = analytics.notSubmittedBooks || books.filter((b) => b.loanInfo?.overdueDays > 0);
  const defaultersByPerson = analytics.defaultersByPerson || [];
  const genreBreakdown = analytics.genreBreakdown || [];

  const totalBooks = stats.totalBooks || 1;
  const pctAvailable = Math.round(((stats.availableBooks || 0) / totalBooks) * 100);
  const pctOnTime = Math.round(((stats.onTimeAllottedBooks || 0) / totalBooks) * 100);
  const pctOverdue = Math.round(((stats.overdueBooks || 0) / totalBooks) * 100);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', color: '#ffffff', margin: 0, fontWeight: '800' }}>
                Library Incharge — Admin Panel
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
                LIVE BOOK & PENALTY ANALYTICS
              </span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Complete analysis of Available, Allotted, Pending FCFS Requests, and Not-Submitted Books with Penalties (+₹5/day).
            </div>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Executive KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {[
          { label: 'Currently Available', val: stats.availableBooks || 0, sub: `${pctAvailable}% of ${stats.totalBooks || 0} books`, color: '#10b981', tab: 'available' },
          { label: 'Allotted Books', val: stats.allottedBooks || 0, sub: `${stats.onTimeAllottedBooks || 0} on-time • ${stats.overdueBooks || 0} overdue`, color: '#38bdf8', tab: 'allotted' },
          { label: 'Pending Requests', val: stats.totalQueuedRequests || 0, sub: `Across ${stats.pendingBooksCount || 0} book(s) (FCFS)`, color: '#a78bfa', tab: 'pending' },
          { label: 'Not Submitted (Overdue)', val: stats.overdueBooks || 0, sub: `${stats.defaultersCount || 0} student(s) past 15d`, color: '#fb7185', tab: 'defaulters' },
          { label: 'Unpaid Penalties', val: `₹${stats.totalPendingPenalties || 0}`, sub: '+₹5/day beyond 15 days', color: '#f59e0b', tab: 'defaulters' },
          { label: 'Collected via Gateway', val: `₹${stats.totalCollectedPenalties || 0}`, sub: `${stats.totalTransactions || 0} settled txns`, color: '#34d399', tab: 'payments' }
        ].map((tile) => (
          <div
            key={tile.label}
            onClick={() => setSubTab(tile.tab)}
            style={{
              background: 'rgba(15, 23, 42, 0.78)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>
              {tile.label}
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: '800', color: tile.color, margin: '0.2rem 0' }}>
              {tile.val}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tile.sub}</div>
          </div>
        ))}
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: 'Analytics Overview', icon: BarChart3 },
          { id: 'available', label: `Currently Available (${availableBooks.length})`, icon: BookCheck },
          { id: 'allotted', label: `Allotted (${allottedBooks.length})`, icon: BookOpen },
          { id: 'pending', label: `Pending Requests (${pendingRequests.length})`, icon: ListOrdered },
          { id: 'defaulters', label: `Not Submitted & Penalty (${defaultersByPerson.length})`, icon: UserX },
          { id: 'payments', label: `Payment Logs (${payments.length})`, icon: CreditCard },
          { id: 'users', label: `Users (${users.filter(u => u.role !== 'admin').length})`, icon: Users }
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: active ? '#ffffff' : t.id === 'defaulters' && defaultersByPerson.length > 0 ? '#fda4af' : '#94a3b8',
                background: active ? 'rgba(99, 102, 241, 0.28)' : 'rgba(15, 23, 42, 0.55)',
                border: active ? '1px solid rgba(99, 102, 241, 0.55)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer'
              }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: ANALYTICS OVERVIEW ================= */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Visual Distribution Bar */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', fontWeight: '700' }}>
                Book DB Status Distribution ({stats.totalBooks || 0} Total Books)
              </h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#10b981' }}>● Available: {stats.availableBooks || 0} ({pctAvailable}%)</span>
                <span style={{ color: '#38bdf8' }}>● Allotted On-Time: {stats.onTimeAllottedBooks || 0} ({pctOnTime}%)</span>
                <span style={{ color: '#fb7185' }}>● Not Submitted / Overdue: {stats.overdueBooks || 0} ({pctOverdue}%)</span>
              </div>
            </div>
            <div style={{
              width: '100%',
              height: '16px',
              borderRadius: '999px',
              overflow: 'hidden',
              display: 'flex',
              background: 'rgba(255,255,255,0.06)'
            }}>
              <div style={{ width: `${pctAvailable}%`, background: '#10b981', transition: 'width 0.4s ease' }} />
              <div style={{ width: `${pctOnTime}%`, background: '#38bdf8', transition: 'width 0.4s ease' }} />
              <div style={{ width: `${pctOverdue}%`, background: '#f43f5e', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* 2-Column Split: Genre Breakdown + Defaulters Snapshot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {/* Genre / Subject Analysis */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.96rem', color: '#ffffff', fontWeight: '700' }}>
                Category Breakdown (Available vs Allotted vs Overdue)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0.4rem' }}>Category</th>
                    <th style={{ padding: '0.5rem 0.4rem' }}>Total</th>
                    <th style={{ padding: '0.5rem 0.4rem', color: '#10b981' }}>Avail.</th>
                    <th style={{ padding: '0.5rem 0.4rem', color: '#38bdf8' }}>Allotted</th>
                    <th style={{ padding: '0.5rem 0.4rem', color: '#fb7185' }}>Overdue</th>
                    <th style={{ padding: '0.5rem 0.4rem', color: '#a78bfa' }}>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {genreBreakdown.map((g) => (
                    <tr key={g.genre} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.55rem 0.4rem', color: '#f8fafc', fontWeight: '600' }}>{g.genre}</td>
                      <td style={{ padding: '0.55rem 0.4rem', color: '#cbd5e1' }}>{g.total}</td>
                      <td style={{ padding: '0.55rem 0.4rem', color: '#10b981', fontWeight: '700' }}>{g.available}</td>
                      <td style={{ padding: '0.55rem 0.4rem', color: '#38bdf8', fontWeight: '700' }}>{g.allotted}</td>
                      <td style={{ padding: '0.55rem 0.4rem', color: g.overdue > 0 ? '#fb7185' : '#64748b', fontWeight: '700' }}>{g.overdue}</td>
                      <td style={{ padding: '0.55rem 0.4rem', color: g.pendingReqs > 0 ? '#a78bfa' : '#64748b' }}>{g.pendingReqs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Persons Who Did Not Submit + Penalty Snapshot */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.06)',
              border: '1px solid rgba(244, 63, 94, 0.28)',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.96rem', color: '#fda4af', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} />
                  Persons Who Did Not Submit (Penalty Report)
                </h3>
                <button
                  onClick={() => setSubTab('defaulters')}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.74rem', cursor: 'pointer', fontWeight: '600' }}
                >
                  View Full Report →
                </button>
              </div>
              {defaultersByPerson.length === 0 ? (
                <div style={{ color: '#34d399', fontSize: '0.84rem', padding: '1rem 0' }}>
                  No overdue defaulters — all allotted books are within the 15-day time limit.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {defaultersByPerson.map((person) => (
                    <div
                      key={person.userId}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 0.9rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.86rem' }}>{person.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{person.email}</div>
                        <div style={{ fontSize: '0.72rem', color: '#fda4af', marginTop: '0.15rem' }}>
                          {person.overdueBooksCount} book(s) not submitted • {person.totalOverdueDays} overdue day(s)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: person.unpaidPenalty > 0 ? '#fb7185' : '#34d399' }}>
                          ₹{person.unpaidPenalty}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          {person.unpaidPenalty > 0 ? 'Unpaid Penalty' : 'Settled'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CURRENTLY AVAILABLE BOOKS ================= */}
      {subTab === 'available' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Book Title</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category & Code</th>
                <th style={{ padding: '0.85rem 1rem' }}>Condition</th>
                <th style={{ padding: '0.85rem 1rem' }}>Listed / Held By</th>
                <th style={{ padding: '0.85rem 1rem' }}>Chain Hops</th>
                <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availableBooks.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#f8fafc' }}>{b.title}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                    {b.genre} • <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{b.courseCode}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontWeight: '600' }}>{b.condition}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ color: '#e2e8f0' }}>{b.currentOwner?.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{b.currentOwner?.email}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc' }}>{b.totalHops || 1}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => onViewJourney(b)}
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
                      <button
                        disabled={busyId === b._id}
                        onClick={() => {
                          if (window.confirm(`Delete '${b.title}' from Book DB?`)) {
                            runAdminAction(`/api/admin/books/${b._id}`, 'DELETE', null, b._id);
                          }
                        }}
                        style={{
                          padding: '0.3rem 0.45rem',
                          borderRadius: '6px',
                          background: 'rgba(244, 63, 94, 0.15)',
                          border: '1px solid rgba(244, 63, 94, 0.35)',
                          color: '#fb7185',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 3: ALLOTTED BOOKS ================= */}
      {subTab === 'allotted' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {allottedBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No books are currently allotted to students.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Allotted Book</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Allotted To</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Allotted / Due Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>15-Day Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Pending Queue</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {allottedBooks.map((b) => {
                  const loan = b.loanInfo || {};
                  return (
                    <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '700', color: '#f8fafc' }}>{b.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.courseCode}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{b.currentOwner?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>{b.currentOwner?.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.74rem', color: '#cbd5e1' }}>
                        <div>Claimed: {loan.claimedAt ? new Date(loan.claimedAt).toLocaleDateString() : '—'}</div>
                        <div style={{ color: loan.overdueDays > 0 ? '#fb7185' : '#94a3b8' }}>
                          Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {loan.isOverdue ? (
                          <span style={{ color: '#fb7185', fontWeight: '700' }}>
                            Not Submitted • +{loan.overdueDays}d (₹{loan.penaltyAmount})
                          </span>
                        ) : loan.penaltyPaid ? (
                          <span style={{ color: '#34d399', fontWeight: '600' }}>Penalty Paid</span>
                        ) : (
                          <span style={{ color: '#38bdf8', fontWeight: '600' }}>
                            On Time ({loan.daysRemaining}d left)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#a78bfa', fontWeight: '600' }}>
                        {b.requestQueue?.length || 0} pending
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {!loan.isOverdue && (
                            <button
                              disabled={busyId === b._id}
                              onClick={() => runAdminAction(`/api/admin/books/${b._id}/simulate-overdue`, 'POST', { daysAgo: 19 }, b._id)}
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
                          <button
                            disabled={busyId === b._id}
                            onClick={() => runAdminAction(`/api/admin/books/${b._id}/force-relist`, 'POST', null, b._id)}
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
                            <RotateCcw size={11} /> Return to DB
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= TAB 4: PENDING REQUESTS (FCFS) ================= */}
      {subTab === 'pending' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No pending FCFS book requests right now.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Queue Position</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Requested Book</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Requested By (Pending Person)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Currently Allotted To</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Requested On</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req, idx) => (
                  <tr key={`${req.bookId}_${req.requesterId}_${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        fontFamily: 'monospace',
                        background: req.position === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                        color: req.position === 1 ? '#34d399' : '#c4b5fd'
                      }}>
                        Req #{req.position} {req.position === 1 ? '(Next FCFS)' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#f8fafc' }}>{req.bookTitle}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{req.courseCode}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{req.requesterName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>{req.requesterEmail}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      {req.currentHolderName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.76rem' }}>
                      {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ================= TAB 5: NOT SUBMITTED & PENALTY (DEFAULTERS REPORT) ================= */}
      {subTab === 'defaulters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {defaultersByPerson.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', color: '#34d399' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '0.6rem' }} />
              <div style={{ fontWeight: '700' }}>Zero Defaulters! Every student is within the 15-day submission limit.</div>
            </div>
          ) : (
            defaultersByPerson.map((person) => (
              <div
                key={person.userId}
                style={{
                  background: 'rgba(244, 63, 94, 0.07)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.4rem'
                }}
              >
                {/* Person Summary Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '0.9rem',
                  marginBottom: '0.9rem',
                  borderBottom: '1px solid rgba(244, 63, 94, 0.2)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <UserX size={18} color="#fb7185" />
                      <span style={{ fontSize: '1.08rem', fontWeight: '800', color: '#ffffff' }}>{person.name}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: 'rgba(244, 63, 94, 0.2)',
                        color: '#fda4af'
                      }}>
                        {person.overdueBooksCount} Book(s) Not Submitted
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.76rem', color: '#cbd5e1', marginTop: '0.35rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={12} color="#38bdf8" /> {person.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} color="#34d399" /> {person.phone}
                      </span>
                      <span>Dept: {person.department}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#fda4af', textTransform: 'uppercase', fontWeight: '700' }}>
                      Total Unpaid Penalty
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: '800', color: person.unpaidPenalty > 0 ? '#fb7185' : '#34d399' }}>
                      ₹{person.unpaidPenalty}.00
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {person.totalOverdueDays} overdue day(s) × ₹5/day
                    </div>
                  </div>
                </div>

                {/* Books Not Submitted by This Person */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {person.books.map((bk) => (
                    <div
                      key={bk._id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '0.8rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.88rem' }}>{bk.title}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                          <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> Held: <strong>{bk.daysHeld}d</strong> (Limit: 15d)</span>
                          <span style={{ color: '#fb7185' }}>Overdue: <strong>{bk.overdueDays} day(s)</strong></span>
                          <span style={{ color: bk.penaltyPaid ? '#34d399' : '#fbbf24' }}>
                            Fine: <strong>₹{bk.penaltyPaid ? `${bk.rawPenaltyAmount} (PAID)` : bk.penaltyAmount}</strong>
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {!bk.penaltyPaid && bk.penaltyAmount > 0 && (
                          <button
                            disabled={busyId === bk._id}
                            onClick={() => runAdminAction(`/api/admin/books/${bk._id}/waive-penalty`, 'POST', null, bk._id)}
                            className="btn-primary"
                            style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          >
                            Waive ₹{bk.penaltyAmount}
                          </button>
                        )}
                        <button
                          disabled={busyId === bk._id}
                          onClick={() => runAdminAction(`/api/admin/books/${bk._id}/force-relist`, 'POST', null, bk._id)}
                          className="btn-secondary"
                          style={{ fontSize: '0.76rem', padding: '0.4rem 0.75rem' }}
                        >
                          Force Return
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TAB 6: PAYMENT GATEWAY LOGS ================= */}
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

      {/* ================= TAB 7: REGISTERED STUDENTS ================= */}
      {subTab === 'users' && (
        <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Semester</th>
                <th style={{ padding: '0.85rem 1rem' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {users.filter((u) => u.role !== 'admin').map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#f8fafc' }}>{u.name}</td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#38bdf8' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{u.department}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{u.semester}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{u.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
