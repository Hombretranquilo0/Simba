'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import branches, { Branch } from '@/data/branches';

interface BranchContextType {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
  clearBranch: () => void;
  showPicker: boolean;
  openPicker: () => void;
  closePicker: () => void;
  isRestricted: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const isRestricted = !!user?.managedBranchId;

  // Auto-select managed branch for restricted managers
  useEffect(() => {
    if (authLoading) return;
    if (isRestricted && user.managedBranchId) {
      const found = branches.find((b) => b.id === user.managedBranchId);
      if (found) {
        setSelectedBranchState(found);
      }
    }
  }, [authLoading, isRestricted, user?.managedBranchId]);

  // Rehydrate from localStorage on mount (only for non-restricted users)
  useEffect(() => {
    if (isRestricted) return;
    const saved = localStorage.getItem('simba_branch');
    if (saved) {
      const found = branches.find((b) => b.id === saved);
      if (found) setSelectedBranchState(found);
    }
  }, [isRestricted]);

  const setSelectedBranch = (branch: Branch) => {
    if (isRestricted) return;
    setSelectedBranchState(branch);
    localStorage.setItem('simba_branch', branch.id);
    setShowPicker(false);
  };

  const clearBranch = () => {
    if (isRestricted) return;
    setSelectedBranchState(null);
    localStorage.removeItem('simba_branch');
  };

  const openPicker = () => {
    if (isRestricted) return;
    setShowPicker(true);
  };
  const closePicker = () => setShowPicker(false);

  return (
    <BranchContext.Provider
      value={{ selectedBranch, setSelectedBranch, clearBranch, showPicker, openPicker, closePicker, isRestricted }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used within BranchProvider');
  return ctx;
}
