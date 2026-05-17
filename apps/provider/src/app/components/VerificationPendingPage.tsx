import { useProviderAuth } from '../context/ProviderAuthContext';
import { useNavigate } from 'react-router';
import { Clock, XCircle, CheckCircle, LogOut, Mail } from 'lucide-react';

export function VerificationPendingPage() {
  const { session, logout } = useProviderAuth();
  const navigate = useNavigate();
  const status = session?.user.verificationStatus ?? 'pending';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const config = {
    pending: {
      icon: <Clock size={48} color="#f59e0b" strokeWidth={1.5} />,
      title: 'Application Under Review',
      body: 'Your provider application has been received and is being reviewed by our team. This usually takes 1–3 business days.',
      hint: 'You'll receive an email notification once a decision has been made.',
      accentColor: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
    },
    under_review: {
      icon: <Clock size={48} color="#3b82f6" strokeWidth={1.5} />,
      title: 'Application In Progress',
      body: 'Our team is actively reviewing your application and documents. We're almost done.',
      hint: 'You'll be notified by email as soon as the review is complete.',
      accentColor: '#3b82f6',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    },
    rejected: {
      icon: <XCircle size={48} color="#ef4444" strokeWidth={1.5} />,
      title: 'Application Not Approved',
      body: 'Unfortunately, your application could not be approved at this time. You may update your documents and reapply.',
      hint: 'If you believe this is a mistake, please contact our support team.',
      accentColor: '#ef4444',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    approved: {
      icon: <CheckCircle size={48} color="#00BF63" strokeWidth={1.5} />,
      title: 'Application Approved',
      body: 'Your application has been approved. You can now access your dashboard.',
      hint: '',
      accentColor: '#00BF63',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
  }[status] ?? {
    icon: <Clock size={48} color="#94a3b8" strokeWidth={1.5} />,
    title: 'Verification Pending',
    body: 'Your account is pending verification.',
    hint: '',
    accentColor: '#94a3b8',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Status banner */}
        <div style={{
          background: config.bgColor,
          borderBottom: `1px solid ${config.borderColor}`,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}>
          {config.icon}
          <h1 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            {config.title}
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>
            {config.body}
          </p>

          {config.hint && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              background: '#f8fafc',
              borderRadius: '10px',
              padding: '1rem',
              border: '1px solid #e2e8f0',
            }}>
              <Mail size={16} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                {config.hint}
              </p>
            </div>
          )}

          {status === 'approved' && (
            <button
              onClick={() => navigate('/provider/dashboard')}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #00BF63 0%, #16A34A 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard
            </button>
          )}

          {status === 'rejected' && (
            <a
              href="mailto:support@servease.app"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem',
                background: '#fef2f2',
                color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              <Mail size={18} />
              Contact Support
            </a>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.875rem',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
