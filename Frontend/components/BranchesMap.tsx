'use client';

import { useEffect, useRef } from 'react';
import branches, { Branch } from '@/data/branches';

interface BranchesMapProps {
  /** If provided, this branch will be highlighted/centered */
  selectedBranchId?: string | null;
  /** Called when user clicks a marker */
  onBranchSelect?: (branch: Branch) => void;
  className?: string;
}

export default function BranchesMap({
  selectedBranchId,
  onBranchSelect,
  className = '',
}: BranchesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // ── Initialize map once ───────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet must run client-side only
    import('leaflet').then((L) => {
      // Fix default marker icons broken by bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center: [-1.9556, 30.0606],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap tiles — no API key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom orange icon for Simba
      const orangeIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: #F06E15;
            border: 3px solid #fff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(240,110,21,0.45);
            display:flex; align-items:center; justify-content:center;
          ">
            <span style="transform:rotate(45deg); font-size:14px; line-height:1;">🛒</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      const selectedIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 44px; height: 44px;
            background: #ea580c;
            border: 3px solid #fff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 0 0 6px rgba(234,88,12,0.25), 0 4px 16px rgba(234,88,12,0.5);
            display:flex; align-items:center; justify-content:center;
          ">
            <span style="transform:rotate(45deg); font-size:16px; line-height:1;">🛒</span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -46],
      });

      // Add markers
      branches.forEach((branch) => {
        const marker = L.marker([branch.lat, branch.lng], { icon: orangeIcon })
          .addTo(map)
          .bindPopup(
            `<div style="min-width:180px; font-family: system-ui, sans-serif;">
              <div style="font-weight:800; font-size:13px; color:#F06E15; margin-bottom:4px;">${branch.shortName}</div>
              <div style="font-size:11px; color:#555; margin-bottom:6px; line-height:1.4;">${branch.address}</div>
              ${branch.phone ? `<div style="font-size:11px; color:#374151;">📞 ${branch.phone}</div>` : ''}
              <div style="font-size:11px; color:#374151; margin-top:2px;">🕐 ${branch.hours}</div>
              ${onBranchSelect ? `
                <button
                  data-branch-id="${branch.id}"
                  style="
                    margin-top:10px; width:100%; padding:7px 0;
                    background:#F06E15; color:#fff; border:none;
                    border-radius:8px; font-size:12px; font-weight:700;
                    cursor:pointer; transition:background 0.15s;
                  "
                  onmouseover="this.style.background='#ea580c'"
                  onmouseout="this.style.background='#F06E15'"
                >
                  Select this branch
                </button>` : ''}
            </div>`,
            { maxWidth: 240 }
          );

        // Delegate the "Select this branch" click to onBranchSelect
        if (onBranchSelect) {
          marker.on('popupopen', () => {
            // Wait for DOM
            setTimeout(() => {
              const btn = containerRef.current?.querySelector(
                `button[data-branch-id="${branch.id}"]`
              ) as HTMLButtonElement | null;
              if (btn) {
                btn.onclick = () => {
                  onBranchSelect(branch);
                  map.closePopup();
                };
              }
            }, 50);
          });
        }

        markersRef.current[branch.id] = { marker, orangeIcon, selectedIcon };
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to selectedBranchId changes ────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(() => {
      Object.entries(markersRef.current).forEach(([id, { marker, orangeIcon, selectedIcon }]) => {
        marker.setIcon(id === selectedBranchId ? selectedIcon : orangeIcon);
      });

      if (selectedBranchId && markersRef.current[selectedBranchId]) {
        const { marker } = markersRef.current[selectedBranchId];
        mapRef.current.setView(marker.getLatLng(), 15, { animate: true });
        marker.openPopup();
      }
    });
  }, [selectedBranchId]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={containerRef}
        className={`w-full rounded-2xl overflow-hidden ${className}`}
        style={{ minHeight: 320 }}
      />
    </>
  );
}
