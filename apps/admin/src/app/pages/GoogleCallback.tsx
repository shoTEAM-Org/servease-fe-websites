import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiFetch } from '../../services/api';

export function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) { navigate('/login', { replace: true }); return; }

    const redirectUri = `${window.location.origin}/auth/google/callback`;

    apiFetch<{ mfaRequired?: boolean; otpId?: string; requiresPhone?: boolean }>(
      '/api/auth/v1/oauth/google/callback',
      {
        method: 'POST',
        body: JSON.stringify({ code, redirect_uri: redirectUri, role: 'admin' }),
      },
    )
      .then(res => {
        if (res.mfaRequired && res.otpId) {
          navigate(`/mfa-verify?otpId=${encodeURIComponent(res.otpId)}`, { replace: true });
        } else {
          navigate('/login?error=oauth_failed', { replace: true });
        }
      })
      .catch(() => navigate('/login?error=oauth_failed', { replace: true }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
      Completing sign-in…
    </div>
  );
}
