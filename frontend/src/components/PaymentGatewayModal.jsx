import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  IndianRupee,
  Clock,
  Lock
} from 'lucide-react';

export default function PaymentGatewayModal({
  book,
  onClose,
  onPaymentSuccess
}) {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING'
  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [bankName, setBankName] = useState('State Bank of India');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);

  if (!book) return null;

  const loan = book.loanInfo || {};
  const penaltyAmount = loan.penaltyAmount || 0;
  const overdueDays = loan.overdueDays || 0;
  const daysHeld = loan.daysHeld || 0;

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    const paymentRef =
      method === 'UPI' ? upiId : method === 'CARD' ? cardNumber : bankName;

    try {
      // Brief gateway animation delay for realism
      await new Promise((r) => setTimeout(r, 900));

      const res = await fetch(`/api/claims/${book._id}/pay-penalty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ method, paymentRef })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment failed');
      }

      setReceipt(data.payment);
      if (onPaymentSuccess) {
        onPaymentSuccess(data.data, data.payment);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: '800' }}>
                BookChain Payment Gateway
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={11} />
                <span>256-bit Secured Penalty Settlement</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {receipt ? (
          /* Success Receipt View */
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: '#34d399'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.35rem' }}>
              Penalty Paid Successfully!
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              You can now click <strong>Pass It On</strong> to transfer the book to the next peer.
            </p>

            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Transaction ID</span>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: '700' }}>{receipt.txnId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Book</span>
                <span style={{ color: '#f8fafc', fontWeight: '600' }}>{receipt.bookTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Method</span>
                <span style={{ color: '#cbd5e1' }}>{receipt.method} ({receipt.paymentRef})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.45rem', marginTop: '0.2rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: '600' }}>Amount Paid</span>
                <span style={{ color: '#34d399', fontWeight: '800', fontSize: '0.95rem' }}>₹{receipt.amount}.00</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              Done & Return to BookChain
            </button>
          </div>
        ) : (
          /* Payment Checkout Form */
          <form onSubmit={handlePay}>
            {/* Penalty Breakdown Summary */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '10px',
              padding: '0.95rem',
              marginBottom: '1.15rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fda4af', fontWeight: '700', fontSize: '0.82rem', marginBottom: '0.55rem' }}>
                <AlertTriangle size={15} />
                <span>Overdue Penalty Breakdown (15-Day Limit Exceeded)</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: '700', marginBottom: '0.5rem' }}>
                {book.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.76rem', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} color="#94a3b8" />
                  <span>Held: <strong>{daysHeld} days</strong></span>
                </div>
                <div>Limit: <strong>15 days</strong></div>
                <div>Overdue: <strong style={{ color: '#fb7185' }}>{overdueDays} day(s)</strong></div>
                <div>Rate: <strong>₹5 / day</strong></div>
              </div>
              <div style={{
                marginTop: '0.7rem',
                paddingTop: '0.6rem',
                borderTop: '1px dashed rgba(244, 63, 94, 0.35)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', color: '#fda4af', fontWeight: '600' }}>Total Payable Penalty</span>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                  <IndianRupee size={18} />
                  {penaltyAmount}.00
                </span>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fda4af',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            {/* Payment Method Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {[
                { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'NETBANKING', label: 'NetBank', icon: Building2 }
              ].map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: '8px',
                      border: active ? '1.5px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                      background: active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.7)',
                      color: active ? '#ffffff' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={14} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method-specific Inputs */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.9rem',
              marginBottom: '1.25rem'
            }}>
              {method === 'UPI' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    UPI ID (GPay / PhonePe / Paytm) *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    required
                    style={{ width: '100%', fontFamily: 'monospace' }}
                  />
                </div>
              )}

              {method === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Debit / Credit Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        style={{ width: '100%', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                        style={{ width: '100%', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'NETBANKING' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Select Bank *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}
            >
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={16} className="spin" />
                  <span>Processing Payment via Gateway...</span>
                </span>
              ) : (
                <span>Pay ₹{penaltyAmount}.00 Now</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
