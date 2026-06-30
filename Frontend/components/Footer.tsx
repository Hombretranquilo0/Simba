'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

/* ─── SVG brand icons (inline, no extra dep) ─────────────────────── */
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const CONTACT_ITEMS = [
  {
    icon: <Mail size={16} />,
    label: 'Customer Support',
    value: 'info@simbasupermarket.rw',
    href: 'mailto:info@simbasupermarket.rw',
  },
  {
    icon: <Phone size={16} />,
    label: 'Main Line',
    value: '+250 788 300 000',
    href: 'tel:+250788300000',
  },
  {
    icon: <Phone size={16} />,
    label: 'Sales & Orders',
    value: '+250 722 300 000',
    href: 'tel:+250722300000',
  },
  {
    icon: <MapPin size={16} />,
    label: 'Location',
    value: 'Kigali, Rwanda',
    href: 'https://maps.google.com/?q=Kigali,Rwanda',
  },
  {
    icon: <Clock size={16} />,
    label: 'Opening Hours',
    value: 'Mon – Sun: 7:00 AM – 9:00 PM',
    href: null,
  },
];

const SOCIAL_LINKS = [
  {
    name: 'WhatsApp',
    href: 'https://wa.me/250788300000',
    icon: <WhatsAppIcon />,
    color: 'hover:bg-green-500 hover:text-white hover:border-green-500',
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/simbarwanda',
    icon: <FacebookIcon />,
    color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600',
  },
  {
    name: 'Twitter / X',
    href: 'https://x.com/simbarwanda',
    icon: <TwitterXIcon />,
    color: 'hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/simbarwanda',
    icon: <InstagramIcon />,
    color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:text-white hover:border-pink-500',
  },
];

export default function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1 — Brand + social ──────────────────────────── */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="inline-block mb-4">
              <span className="text-2xl font-black text-simba-orange dark:text-simba-gold tracking-tighter">
                SIMBA<span className="text-orange-500">SHOP</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Rwanda's trusted supermarket since 2007. Freshness and quality delivered to your doorstep.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, href, icon, color }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-200 ${color}`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 — Quick Links ────────────────────────────── */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: `/${locale}` },
                { label: 'About Us', href: `/${locale}/about` },
                { label: 'Cart', href: `/${locale}/cart` },
                { label: 'My Orders', href: `/${locale}/orders` },
                { label: 'Login', href: `/${locale}/login` },
                { label: 'Sign Up', href: `/${locale}/signup` },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-simba-orange dark:hover:text-simba-gold transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 — Contact Us ─────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-5">
              Contact Us
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl"
                >
                  <div className="p-2 bg-orange-100 dark:bg-simba-gold/10 rounded-xl text-simba-orange dark:text-simba-gold flex-shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-simba-orange dark:hover:text-simba-gold transition-colors break-all"
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center sm:text-left">
            © {year} Simba Rwanda Supermarket. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Made with ❤️ in Kigali, Rwanda
          </p>
        </div>
      </div>
    </footer>
  );
}
