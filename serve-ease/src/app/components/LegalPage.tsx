import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Shield } from 'lucide-react';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
}

export function LegalPage({ title, lastUpdated }: LegalPageProps) {
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Shield style={{ width: '28px', height: '28px', color: '#00BF63' }} />
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{title}</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>Last Updated: {lastUpdated}</p>

        <div style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            Welcome to ServEase. This document contains the {title.toLowerCase()} that govern your use of our platform. By accessing or using the ServEase app, you agree to be bound by these terms.
          </p>
          
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: '16px', marginBottom: '8px' }}>1. General Provisions</h2>
          <p>
            These terms applies to all users of the ServEase platform. We reserve the right to update or modify these terms at any time without prior notice.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: '16px', marginBottom: '8px' }}>2. User Responsibilities</h2>
          <p>
            As a user, you agree to provide accurate information and to conduct yourself in a professional manner while using the platform. Any misuse or violation of our guidelines may result in account termination.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginTop: '16px', marginBottom: '8px' }}>3. Data & Privacy</h2>
          <p>
            Your privacy is important to us. Please review our privacy practices which govern the collection and use of personal data.
          </p>

          <p style={{ marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
            If you have any questions regarding this document, please contact our support team at support@servease.ph.
          </p>
        </div>
      </div>
    </div>
  );
}
