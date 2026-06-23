'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const { locale } = useParams() as { locale: string };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex mb-10 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Link href={`/${locale}`} className="hover:text-simba-orange flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-simba-orange dark:bg-simba-gold/20 p-10 sm:p-16 mb-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full mb-4 inline-block">
            Est. 2007
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">About Simba</h1>
          <p className="text-white/80 text-lg max-w-xl leading-relaxed">
            Rwanda's trusted supermarket, delivering quality and freshness to every household since 2007.
          </p>
        </div>
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -top-8 w-40 h-40 bg-white/5 rounded-full" />
      </motion.section>

      {/* History */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 mb-8"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Our Story</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            Simba Supermarket was founded in <strong className="text-gray-900 dark:text-white">2007</strong> with a simple
            mission: to bring high-quality groceries and household essentials to the people of Rwanda at fair prices.
          </p>
          <p>
            What started as a single store has grown into one of Rwanda's most recognised retail brands, serving thousands
            of customers across Kigali and beyond. Our commitment to freshness, authenticity, and customer satisfaction
            has remained unchanged since day one.
          </p>
          <p>
            Today, Simba carries over 10,000 products — from fresh produce and beverages to electronics and personal care —
            all curated to meet the everyday needs of Rwandan families.
          </p>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          {[
            { year: '2007', label: 'Founded' },
            { year: '19+', label: 'Years of Service' },
            { year: '10K+', label: 'Products' },
          ].map(({ year, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-simba-orange dark:text-simba-gold">{year}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Contact Us</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Mail size={20} />,
              label: 'Customer Support',
              value: 'info@simbasupermarket.rw',
              href: 'mailto:info@simbasupermarket.rw',
            },
            {
              icon: <Phone size={20} />,
              label: 'Main Line',
              value: '+250 788 300 000',
              href: 'tel:+250788300000',
            },
            {
              icon: <Phone size={20} />,
              label: 'Sales & Orders',
              value: '+250 722 300 000',
              href: 'tel:+250722300000',
            },
            {
              icon: <MapPin size={20} />,
              label: 'Location',
              value: 'Kigali, Rwanda',
              href: 'https://maps.google.com/?q=Kigali,Rwanda',
            },
            {
              icon: <Clock size={20} />,
              label: 'Opening Hours',
              value: 'Mon – Sun: 7:00 AM – 9:00 PM',
              href: null,
            },
          ].map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
            >
              <div className="p-2.5 bg-orange-100 dark:bg-simba-gold/10 rounded-xl text-simba-orange dark:text-simba-gold flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-bold text-gray-900 dark:text-white hover:text-simba-orange dark:hover:text-simba-gold transition-colors">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
