import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, MessageCircle } from 'lucide-react';

export function ContactSupportPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '40px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#6B7280', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 24px 0' }}
        >
          <ArrowLeft style={{ width: '18px', height: '18px' }} />
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Contact Support</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ backgroundColor: '#ECFDF5', padding: '12px', borderRadius: '12px' }}>
              <Mail style={{ color: '#00BF63', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Email Us</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '14px' }}>We typically respond within 24 hours.</p>
              <a href="mailto:support@servease.ph" style={{ color: '#00BF63', textDecoration: 'none', fontWeight: 'bold' }}>support@servease.ph</a>
            </div>
          </div>

          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '12px' }}>
              <Phone style={{ color: '#3B82F6', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Call Us</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '14px' }}>Available Monday to Friday, 9am - 5pm.</p>
              <a href="tel:+63212345678" style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 'bold' }}>+63 (2) 1234 5678</a>
            </div>
          </div>

          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ backgroundColor: '#EEF2FF', padding: '12px', borderRadius: '12px' }}>
              <MessageCircle style={{ color: '#6366F1', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Live Chat</h3>
              <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '14px' }}>Chat with our support team in real-time.</p>
              <button style={{ backgroundColor: '#6366F1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Start Chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
