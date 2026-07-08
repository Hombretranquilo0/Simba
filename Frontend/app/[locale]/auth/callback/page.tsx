'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        // GlobalBranchPicker auto-opens on home if no branch stored
        router.push(`/${locale}`);
      } catch {
        router.push(`/${locale}/login?error=auth_failed`);
      }
    } else {
      router.push(`/${locale}/login?error=missing_data`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-simba-orange" />
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Completing sign in…</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-simba-orange" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
