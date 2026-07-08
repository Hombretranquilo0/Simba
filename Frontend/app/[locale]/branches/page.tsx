'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import branches, { Branch } from '@/data/branches';
import { MapPin, Clock, Phone, ChevronRight, Store } from 'lucide-react';
import { motion } from 'framer-motion';

// Load map only on client (Leaflet is browser-only)
const BranchesMap = dynamic(() => import('@/components/BranchesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-sm font-medium">Loading map…</span>
    </div>
  ),
});

export default function BranchesPage() {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    // Scroll to map on mobile
    document.getElementById('branches-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Store size={22} className="text-simba-orange" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Our Branches
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl">
          Find your nearest Simba Supermarket across Kigali. Click a branch to see it on the map.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Branch list (left panel) ───────────────────── */}
        <aside className="lg:w-80 flex-shrink-0 space-y-3">
          {branches.map((branch, idx) => {
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <motion.button
                key={branch.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelect(branch)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                  isSelected
                    ? 'border-simba-orange bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-simba-orange/10'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-simba-orange/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-simba-orange' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-simba-orange/60'}`} />
                      <span className={`font-black text-sm leading-snug ${isSelected ? 'text-simba-orange' : 'text-gray-900 dark:text-white'}`}>
                        {branch.shortName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-4 leading-relaxed">
                      {branch.address}
                    </p>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 pl-4 space-y-1"
                      >
                        {branch.phone && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                            <Phone size={11} className="text-simba-orange flex-shrink-0" />
                            {branch.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                          <Clock size={11} className="text-simba-orange flex-shrink-0" />
                          {branch.hours}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`flex-shrink-0 mt-0.5 transition-transform ${isSelected ? 'rotate-90 text-simba-orange' : 'text-gray-300 dark:text-gray-600 group-hover:text-simba-orange/60'}`}
                  />
                </div>
              </motion.button>
            );
          })}
        </aside>

        {/* ── Map (right panel) ──────────────────────────── */}
        <div className="flex-grow" id="branches-map">
          <div className="sticky top-24">
            <BranchesMap
              selectedBranchId={selectedBranch?.id ?? null}
              onBranchSelect={handleSelect}
              className="h-[480px] lg:h-[600px] border border-gray-100 dark:border-gray-800 shadow-xl"
            />

            {/* Selected branch info card below map */}
            {selectedBranch && (
              <motion.div
                key={selectedBranch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-simba-orange/20 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex-shrink-0">
                    <MapPin size={18} className="text-simba-orange" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-base mb-0.5">
                      {selectedBranch.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {selectedBranch.address}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedBranch.phone && (
                        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <Phone size={13} className="text-simba-orange" />
                          {selectedBranch.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Clock size={13} className="text-simba-orange" />
                        {selectedBranch.hours}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedBranch.lat},${selectedBranch.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-simba-orange hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <MapPin size={15} />
                  Get Directions in Google Maps
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
