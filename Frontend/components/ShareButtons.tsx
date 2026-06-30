'use client';

import { useState } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';

/* ─── Inline SVG brand icons ────────────────────────────────────── */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareButtonsProps {
  productName: string;
  price: number;
}

export default function ShareButtons({ productName, price }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Build the share URL and message on the client so window is available
  const getUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '';

  const shareText = `Check out ${productName} at only ${price.toLocaleString()} RWF on Simba Rwanda Supermarket! 🛒`;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      label: 'Share on WhatsApp',
      bg: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-500 hover:text-white hover:border-green-500',
      href: () =>
        `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${getUrl()}`)}`,
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      label: 'Share on Facebook',
      bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white hover:border-blue-600',
      href: () =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Twitter / X',
      icon: <TwitterXIcon />,
      label: 'Share on Twitter / X',
      bg: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black',
      href: () =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(getUrl())}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement('input');
      input.value = getUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3">
        Share this product
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {shareLinks.map(({ name, icon, label, bg, href }) => (
          <a
            key={name}
            href={href()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${bg}`}
          >
            {icon}
            <span className="hidden sm:inline">{name}</span>
          </a>
        ))}

        {/* Copy link button */}
        <button
          onClick={handleCopy}
          aria-label="Copy link"
          title="Copy link"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
            copied
              ? 'bg-simba-orange text-white border-simba-orange'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-simba-orange hover:text-white hover:border-simba-orange'
          }`}
        >
          {copied ? <Check size={14} /> : <LinkIcon size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
      </div>
    </div>
  );
}
