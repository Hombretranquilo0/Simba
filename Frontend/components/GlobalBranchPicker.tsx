'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';
import BranchPicker from '@/components/BranchPicker';

/**
 * Mounted once in the root layout.
 * - Opens the branch picker automatically after login if no branch is stored.
 * - Renders the picker whenever showPicker is true (e.g. navbar switch button).
 */
export default function GlobalBranchPicker() {
  const { isAuthenticated, isLoading } = useAuth();
  const { selectedBranch, showPicker, openPicker, isRestricted } = useBranch();

  // After auth loads, if logged in and no branch chosen → open picker
  useEffect(() => {
    if (!isLoading && isAuthenticated && !selectedBranch && !isRestricted) {
      openPicker();
    }
  }, [isLoading, isAuthenticated, selectedBranch, isRestricted, openPicker]);

  // Allow any component to open the picker via a custom event
  useEffect(() => {
    const handler = () => { if (!isRestricted) openPicker(); };
    window.addEventListener('open-branch-picker', handler);
    return () => window.removeEventListener('open-branch-picker', handler);
  }, [isRestricted, openPicker]);

  if (!showPicker || isRestricted) return null;

  return (
    <AnimatePresence>
      <BranchPicker required={!selectedBranch} />
    </AnimatePresence>
  );
}
