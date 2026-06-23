'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearch } from '@/context/SearchContext';
import { useTranslation } from '@/context/TranslationContext';

interface PriceSliderProps {
  min: number;
  max: number;
}

const PriceSlider = ({ min, max }: PriceSliderProps) => {
  const { priceRange, setPriceRange } = useSearch();
  const { t } = useTranslation();
  
  const [minVal, setMinVal] = useState(priceRange[0]);
  const [maxVal, setMaxVal] = useState(priceRange[1]);
  const minValRef = useRef(priceRange[0]);
  const maxValRef = useRef(priceRange[1]);
  const range = useRef<HTMLDivElement>(null);

  // Sync internal state with context (for initial load and external resets)
  useEffect(() => {
    setMinVal(priceRange[0]);
    setMaxVal(priceRange[1]);
    minValRef.current = priceRange[0];
    maxValRef.current = priceRange[1];
  }, [priceRange]);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // Update context when values change (debounced or on change)
  useEffect(() => {
    const handler = setTimeout(() => {
      setPriceRange([minVal, maxVal]);
    }, 500);
    return () => clearTimeout(handler);
  }, [minVal, maxVal, setPriceRange]);

  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {t('common.priceRange') || 'Price Range'}
        </h3>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-simba-orange dark:text-simba-gold bg-orange-50 dark:bg-simba-gold/15 px-2 py-1 rounded-lg">
             {minVal.toLocaleString()} - {maxVal.toLocaleString()} RWF
           </span>
        </div>
      </div>

      <div className="relative h-10 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
          }}
          className="thumb thumb--left"
          style={{ zIndex: minVal > max - 100 ? "5" : undefined }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
          }}
          className="thumb thumb--right"
        />

        <div className="slider">
          <div className="slider__track" />
          <div ref={range} className="slider__range" />
        </div>
      </div>
      
      <style jsx>{`
        .slider {
          position: relative;
          width: 100%;
        }

        .slider__track,
        .slider__range {
          position: absolute;
          height: 6px;
          border-radius: 3px;
        }

        .slider__track {
          background-color: #e5e7eb;
          width: 100%;
          z-index: 1;
        }

        .dark .slider__track {
          background-color: #374151;
        }

        .slider__range {
          background-color: #F06E15;
          z-index: 2;
        }

        .dark .slider__range {
          background-color: #f59a0a;
        }

        /* Removing the default appearance */
        .thumb,
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .thumb {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          background: none;
        }

        /* Webkit browsers */
        .thumb::-webkit-slider-thumb {
          background-color: #ffffff;
          border: 3px solid #F06E15;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          cursor: pointer;
          height: 24px;
          width: 24px;
          margin-top: 4px;
          pointer-events: all;
          position: relative;
        }

        .dark .thumb::-webkit-slider-thumb {
          background-color: #111827;
          border-color: #f59a0a;
        }

        /* Firefox browsers */
        .thumb::-moz-range-thumb {
          background-color: #ffffff;
          border: 3px solid #F06E15;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          cursor: pointer;
          height: 24px;
          width: 24px;
          pointer-events: all;
          position: relative;
        }
        
        .dark .thumb::-moz-range-thumb {
          background-color: #111827;
          border-color: #f59a0a;
        }
      `}</style>
    </div>
  );
};

export default PriceSlider;
