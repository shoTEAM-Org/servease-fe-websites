import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, MessageSquare, Award } from 'lucide-react';

export function ProviderCommunityPage() {
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
          <Users style={{ width: '32px', height: '32px', color: '#00BF63' }} />
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Provider Community</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
          Connect with other professionals, share your experiences, and grow your business together. Our community is a safe space to learn and ask questions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <MessageSquare style={{ width: '32px', height: '32px', color: '#3B82F6', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Forums</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>Discuss tips, share advice, and get answers from experts.</p>
            <button style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Join Discussion</button>
          </div>

          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <Award style={{ width: '32px', height: '32px', color: '#F59E0B', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Events</h3>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>Attend local meetups and webinars to level up your skills.</p>
            <button style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>View Events</button>
          </div>
        </div>

        <div style={{ backgroundColor: '#ECFDF5', padding: '32px', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#065F46', marginBottom: '12px' }}>Join our Facebook Group</h2>
          <p style={{ color: '#047857', fontSize: '16px', marginBottom: '24px' }}>
            Can't wait to connect? Join thousands of other providers in our official Facebook group.
          </p>
          <a href="https://facebook.com/groups/servease" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', backgroundColor: '#00BF63', color: 'white', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }}>
            Go to Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
