'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import branches, { Branch } from '@/data/branches';
import { useBranch } from '@/context/BranchContext';
import { MapPin, X, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BranchesMap = dynamic(() => import('@/components/BranchesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-xs">Loading map…</span>
    </div>
  ),
});

interface BranchPickerProps {
  /** If true the X close button is hidden — user MUST pick a branch (post-login) */
  required?: boolean;
  onClose?: () => void;
}

export default function BranchPicker({ required = false, onClose }: BranchPickerProps) {
  const { selectedBranch, setSelectedBranch, closePicker } = useBranch();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClose = () => {
    closePicker();
    onClose?.();
  };

  const handleSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <MapPin size={18} className="text-simba-orange" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Choose your branch</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {required ? 'Select a branch to continue shopping' : 'Switch to a different branch'}
              </p>
            </div>
          </div>
          {!required && (
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-grow">
          {/* Map */}
          <div className="px-6 pt-5 pb-3">
            <BranchesMap
              selectedBranchId={hoveredId ?? selectedBranch?.id ?? null}
              className="h-48"
            />
          </div>

          {/* Branch list */}
          <div className="px-6 pb-6 space-y-2">
            {branches.map((branch) => {
              const isSelected = selectedBranch?.id === branch.id;
              return (
                <button
                  key={branch.id}
                  onClick={() => handleSelect(branch)}
                  onMouseEnter={() => setHoveredId(branch.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-simba-orange bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-100 dark:border-gray-800 hover:border-simba-orange/40 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black ${
                    isSelected
                      ? 'bg-simba-orange text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {isSelected ? <Check size={14} /> : <MapPin size={13} />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-simba-orange' : 'text-gray-900 dark:text-white'}`}>
                      {branch.shortName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{branch.address}</p>
                  </div>
                  <ChevronRight size={16} className={isSelected ? 'text-simba-orange' : 'text-gray-300'} />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
