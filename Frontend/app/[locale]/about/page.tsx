'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const FAQS = [
  { q: 'Do you deliver on public holidays?', a: 'Yes! We deliver 7 days a week including public holidays, from 8:00 AM to 6:00 PM. Orders placed after 4:00 PM on a holiday will be delivered the following day.' },
  { q: 'Can I return fresh vegetables or perishable items?', a: 'Yes, within 24 hours of delivery. If a fresh product does not meet your quality expectations, contact us immediately with a photo and we will arrange a replacement or refund.' },
  { q: 'What is the minimum order amount?', a: 'Our minimum order is 2,500 RWF to ensure deliveries remain logistically viable and reach you in the best condition.' },
  { q: 'Which payment methods do you accept?', a: 'We currently offer Cash on Delivery (CoD) and simulated card payment at checkout. Mobile money integration (MTN MoMo & Airtel Money) is coming soon.' },
  { q: 'How long does delivery take?', a: 'Standard delivery within Kigali takes 1–3 hours. Orders outside Kigali may take up to 24 hours. You will receive a confirmation call once your order is dispatched.' },
  { q: 'Can I change or cancel my order after placing it?', a: 'You can cancel or modify your order within 15 minutes of placing it by calling our support line. After that, the order enters fulfilment and cannot be changed.' },
];

export default function AboutPage() {
  const { locale } = useParams() as { locale: string };
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 mt-8"
      >
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-black text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-simba-orange transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
