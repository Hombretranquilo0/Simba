'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard, Truck, MapPin, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import API_URL from '@/utils/api';
import { jsPDF } from 'jspdf';

const MIN_ORDER = 2500;
const RW_PHONE = /^\+2507[2389]\d{7}$/;

export default function CartPage() {
  const { items, totalPrice, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, addToCart } = useCart();
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<import('@/types/product').CartItem[]>([]);

  // ── 3-step checkout state ──────────────────────────────────────
  // step 1 = fulfillment choice, step 2 = details form, step 3 = pay
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // shared
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // delivery-specific
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // pickup-specific
  const [pickupName, setPickupName] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupNameError, setPickupNameError] = useState('');
  const [pickupTimeError, setPickupTimeError] = useState('');

  const [orderSnapshot, setOrderSnapshot] = useState<{
    items: import('@/types/product').CartItem[];
    total: number;
    fulfillmentType: 'delivery' | 'pickup';
    phone: string;
    deliveryNotes: string;
    locationLink: string;
    pickupName: string;
    pickupTime: string;
    orderId: string;
    date: string;
  } | null>(null);

  const saveForLater = (item: import('@/types/product').CartItem) => {
    removeFromCart(item.id);
    setSavedItems(prev => prev.some(s => s.id === item.id) ? prev : [...prev, { ...item, quantity: 1 }]);
  };

  const moveToCart = (item: import('@/types/product').CartItem) => {
    setSavedItems(prev => prev.filter(s => s.id !== item.id));
    addToCart(item as any);
  };

  const removeSaved = (id: number) => setSavedItems(prev => prev.filter(s => s.id !== id));

  const { t } = useTranslation();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => { setIsMounted(true); }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=cart`);
      return;
    }
    setCheckoutStep(1);
    setOrderComplete(false);
    setOrderError(null);
    setShowPaymentModal(true);
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setOrderError(null);
    setPhoneError('');
    setPickupNameError('');
    setPickupTimeError('');
  };

  // GPS → Google Maps link
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationLink('Geolocation not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationLink(`https://maps.google.com/?q=${latitude},${longitude}`);
        setLocationLoading(false);
      },
      () => {
        setLocationLink('');
        setLocationLoading(false);
        alert('Unable to retrieve your location. Please allow location access and try again.');
      },
    );
  };

  // Step 2 → 3 validation
  const validateDetails = () => {
    let valid = true;

    if (!RW_PHONE.test(phone)) {
      setPhoneError('Enter a valid Rwandan number (e.g. +250781234567)');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (fulfillmentType === 'pickup') {
      if (!pickupName.trim()) {
        setPickupNameError('Please enter the name for pickup');
        valid = false;
      } else {
        setPickupNameError('');
      }
      if (!pickupTime.trim()) {
        setPickupTimeError('Please enter a pickup time');
        valid = false;
      } else {
        setPickupTimeError('');
      }
    }

    if (valid) setCheckoutStep(3);
  };

  const validateAndPay = async () => {
    setIsProcessing(true);
    setOrderError(null);

    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1800));

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: totalPrice,
          fulfillmentType,
          phone,
          deliveryNotes: fulfillmentType === 'delivery' ? deliveryNotes : undefined,
          locationLink: fulfillmentType === 'delivery' ? locationLink : undefined,
          pickupName: fulfillmentType === 'pickup' ? pickupName : undefined,
          pickupTime: fulfillmentType === 'pickup' ? pickupTime : undefined,
        }),
      });

      if (response.ok) {
        const snap = {
          items: [...items],
          total: totalPrice,
          fulfillmentType,
          phone,
          deliveryNotes,
          locationLink,
          pickupName,
          pickupTime,
          orderId: Math.floor(Math.random() * 90000 + 10000).toString(),
          date: new Date().toLocaleString('en-RW', { dateStyle: 'full', timeStyle: 'short' }),
        };
        setOrderSnapshot(snap);
        setOrderComplete(true);
        clearCart();
        setTimeout(() => {
          setShowPaymentModal(false);
          router.push(`/${locale}/orders`);
        }, 7000);
      } else if (response.status === 401) {
        logout();
        closeModal();
        router.push(`/${locale}/login?redirect=cart`);
      } else {
        const err = await response.json().catch(() => ({}));
        setOrderError(err.message || 'Order failed. Please try again.');
      }
    } catch {
      setOrderError('Network error. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const printInvoice = () => {
    if (!orderSnapshot) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 48;
    const contentW = pageW - margin * 2;
    let y = margin;

    // ── Brand header ──────────────────────────────────────────────
    doc.setFillColor(249, 115, 22); // simba-orange
    doc.rect(0, 0, pageW, 72, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('SIMBA', margin, 46);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Rwanda Supermarket', margin, 62);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`INVOICE #${orderSnapshot.orderId}`, pageW - margin, 44, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(orderSnapshot.date, pageW - margin, 60, { align: 'right' });

    y = 100;

    // ── Meta block ────────────────────────────────────────────────
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, y, contentW, orderSnapshot.fulfillmentType === 'pickup' && (orderSnapshot.pickupName || orderSnapshot.pickupTime) ? 92 : orderSnapshot.deliveryNotes ? 92 : 52, 6, 6, 'F');

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', margin + 12, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(orderSnapshot.phone, margin + 60, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Fulfillment:', margin + 12, y + 36);
    doc.setFont('helvetica', 'normal');
    doc.text(
      orderSnapshot.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup',
      margin + 72, y + 36
    );

    // delivery-specific extra rows
    let extraRows = 0;
    if (orderSnapshot.fulfillmentType === 'delivery') {
      if (orderSnapshot.deliveryNotes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', margin + 12, y + 54);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(orderSnapshot.deliveryNotes, contentW - 75);
        doc.text(noteLines, margin + 60, y + 54);
        extraRows++;
      }
      if (orderSnapshot.locationLink) {
        const locY = y + 54 + extraRows * 18;
        doc.setFont('helvetica', 'bold');
        doc.text('Location:', margin + 12, locY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 102, 204);
        doc.text(orderSnapshot.locationLink, margin + 60, locY);
        doc.setTextColor(80, 80, 80);
        extraRows++;
      }
    } else {
      // pickup-specific
      if (orderSnapshot.pickupName) {
        doc.setFont('helvetica', 'bold');
        doc.text('Pickup Name:', margin + 12, y + 54);
        doc.setFont('helvetica', 'normal');
        doc.text(orderSnapshot.pickupName, margin + 86, y + 54);
        extraRows++;
      }
      if (orderSnapshot.pickupTime) {
        doc.setFont('helvetica', 'bold');
        doc.text('Pickup Time:', margin + 12, y + 54 + extraRows * 18);
        doc.setFont('helvetica', 'normal');
        doc.text(orderSnapshot.pickupTime, margin + 80, y + 54 + extraRows * 18);
        extraRows++;
      }
    }

    y += 52 + Math.max(extraRows, 1) * 20;

    // ── Table header ──────────────────────────────────────────────
    const colProduct = margin;
    const colQty = margin + contentW * 0.64;
    const colAmount = pageW - margin;
    const rowH = 28;

    doc.setFillColor(249, 115, 22);
    doc.rect(margin, y, contentW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Product', colProduct + 8, y + 18);
    doc.text('Qty', colQty, y + 18, { align: 'center' });
    doc.text('Amount (RWF)', colAmount, y + 18, { align: 'right' });
    y += rowH;

    // ── Table rows ────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    orderSnapshot.items.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(255, 248, 240);
      }
      doc.rect(margin, y, contentW, rowH, 'F');

      doc.setTextColor(30, 30, 30);
      const nameLines = doc.splitTextToSize(item.name, contentW * 0.60);
      doc.text(nameLines, colProduct + 8, y + 18);
      doc.text(String(item.quantity), colQty, y + 18, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${(item.price * item.quantity).toLocaleString()}`, colAmount, y + 18, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      // Bottom border
      doc.setDrawColor(238, 238, 238);
      doc.line(margin, y + rowH, margin + contentW, y + rowH);

      y += rowH;
    });

    // ── Total row ─────────────────────────────────────────────────
    doc.setFillColor(255, 248, 240);
    doc.rect(margin, y, contentW, rowH + 4, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentW, y);
    doc.setLineWidth(0.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('TOTAL', colProduct + 8, y + 20);
    doc.setTextColor(249, 115, 22);
    doc.text(`${orderSnapshot.total.toLocaleString()} RWF`, colAmount, y + 20, { align: 'right' });
    y += rowH + 20;

    // ── Footer ────────────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 40;
    doc.setDrawColor(238, 238, 238);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageW - margin, footerY - 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(
      'Thank you for shopping at Simba Supermarket  ·  simba-shop.rw  ·  +250 788 300 000',
      pageW / 2, footerY + 4,
      { align: 'center' }
    );

    // ── Download as PDF ───────────────────────────────────────────
    doc.save(`Simba-Invoice-${orderSnapshot.orderId}.pdf`);
  };

  if (!isMounted) return null;

  if (items.length === 0 && !orderComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-32 text-center"
      >
        <div className="bg-gray-50 dark:bg-gray-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <ShoppingBag className="text-gray-300 dark:text-gray-700" size={64} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{t('common.emptyCart')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg font-medium">
          {t('common.emptyCartDesc')}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-3 bg-simba-orange hover:bg-simba-orange text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-simba-orange/20 hover:shadow-simba-orange/40 hover:-translate-y-1 active:translate-y-0"
        >
          <ArrowLeft size={20} />
          {t('common.startShopping')}
        </Link>
      </motion.div>
    );
  }

  const belowMinimum = totalPrice < MIN_ORDER;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Checkout Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {!orderComplete ? (
                <>
                  {/* Step indicator */}
                  {!orderComplete && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                      {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            checkoutStep === s ? 'bg-orange-500 text-white scale-110' :
                            checkoutStep > s ? 'bg-orange-200 text-orange-700' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-400'
                          }`}>{s}</div>
                          {s < 3 && <div className={`w-8 h-0.5 transition-all ${checkoutStep > s ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── STEP 1: Fulfillment choice ── */}
                  {checkoutStep === 1 && (
                    <>
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-black mb-1">How would you like to receive your order?</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Choose fulfillment type</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                          onClick={() => setFulfillmentType('delivery')}
                          className={`flex flex-col items-center gap-3 py-8 rounded-3xl border-2 font-black transition-all ${
                            fulfillmentType === 'delivery'
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Truck size={32} />
                          <span className="text-sm">Delivery</span>
                        </button>
                        <button
                          onClick={() => setFulfillmentType('pickup')}
                          className={`flex flex-col items-center gap-3 py-8 rounded-3xl border-2 font-black transition-all ${
                            fulfillmentType === 'pickup'
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <ShoppingBag size={32} />
                          <span className="text-sm">Pick Up</span>
                        </button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setCheckoutStep(2)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl text-sm"
                      >
                        Continue →
                      </motion.button>
                      <button onClick={closeModal} className="w-full py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-600 mt-3">
                        Cancel
                      </button>
                    </>
                  )}

                  {/* ── STEP 2: Details form ── */}
                  {checkoutStep === 2 && (
                    <>
                      <div className="text-center mb-6">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-3 ${fulfillmentType === 'delivery' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                          {fulfillmentType === 'delivery' ? <Truck size={28} /> : <ShoppingBag size={28} />}
                        </div>
                        <h3 className="text-xl font-black mb-1">{fulfillmentType === 'delivery' ? 'Delivery Details' : 'Pickup Details'}</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Fill in your information</p>
                      </div>

                      {/* Phone — both flows */}
                      <div className="mb-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Phone Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                          placeholder="+250781234567"
                          className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-sm bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-colors ${phoneError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-orange-400'}`}
                        />
                        {phoneError && <p className="text-red-500 text-xs font-bold mt-1">{phoneError}</p>}
                      </div>

                      {/* Delivery-specific fields */}
                      {fulfillmentType === 'delivery' && (
                        <>
                          <div className="mb-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Delivery Landmark / Instructions</label>
                            <textarea
                              value={deliveryNotes}
                              onChange={e => setDeliveryNotes(e.target.value)}
                              placeholder="e.g. Opposite Gisozi Sector Office, near the pharmacy..."
                              rows={3}
                              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-medium text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:border-orange-400 outline-none transition-colors resize-none"
                            />
                          </div>
                          <div className="mb-6">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Location Link</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={locationLink}
                                onChange={e => setLocationLink(e.target.value)}
                                placeholder="Paste a Google Maps link..."
                                className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 font-medium text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:border-orange-400 outline-none transition-colors min-w-0"
                              />
                              <button
                                type="button"
                                onClick={handleShareLocation}
                                disabled={locationLoading}
                                title="Use my current location"
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-3 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 text-orange-600 rounded-2xl font-black text-xs hover:bg-orange-100 transition-all disabled:opacity-50"
                              >
                                {locationLoading
                                  ? <div className="w-4 h-4 border-2 border-orange-400/40 border-t-orange-500 rounded-full animate-spin" />
                                  : <Navigation size={16} />}
                                <span className="hidden sm:inline">GPS</span>
                              </button>
                            </div>
                            {locationLink && locationLink.startsWith('https://') && (
                              <a href={locationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-bold mt-1 inline-flex items-center gap-1">
                                <MapPin size={12} /> View on map
                              </a>
                            )}
                          </div>
                        </>
                      )}

                      {/* Pickup-specific fields */}
                      {fulfillmentType === 'pickup' && (
                        <>
                          <div className="mb-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Name for Pickup <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={pickupName}
                              onChange={e => { setPickupName(e.target.value); setPickupNameError(''); }}
                              placeholder="Full name on the order"
                              className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-sm bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-colors ${pickupNameError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-orange-400'}`}
                            />
                            {pickupNameError && <p className="text-red-500 text-xs font-bold mt-1">{pickupNameError}</p>}
                          </div>
                          <div className="mb-6">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Pickup Time <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={pickupTime}
                              onChange={e => { setPickupTime(e.target.value); setPickupTimeError(''); }}
                              placeholder="e.g. Tomorrow at 10:00 AM"
                              className={`w-full px-4 py-3 rounded-2xl border-2 font-bold text-sm bg-gray-50 dark:bg-gray-800 dark:text-white outline-none transition-colors ${pickupTimeError ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-orange-400'}`}
                            />
                            {pickupTimeError && <p className="text-red-500 text-xs font-bold mt-1">{pickupTimeError}</p>}
                          </div>
                        </>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => setCheckoutStep(1)}
                          className="px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 font-black text-sm hover:border-gray-300 transition-all"
                        >
                          ← Back
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={validateDetails}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl text-sm"
                        >
                          Continue to Payment →
                        </motion.button>
                      </div>
                    </>
                  )}

                  {/* ── STEP 3: Pay now ── */}
                  {checkoutStep === 3 && (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-3xl flex items-center justify-center mx-auto mb-3 text-white dark:text-gray-900">
                          <CreditCard size={28} />
                        </div>
                        <h3 className="text-xl font-black mb-1">Pay Now</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Simulated card payment</p>
                      </div>

                      {/* Order summary recap */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-gray-500">
                          <span>Fulfillment</span>
                          <span className={`font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${fulfillmentType === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {fulfillmentType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-500">
                          <span>Phone</span>
                          <span className="font-black text-gray-800 dark:text-gray-200">{phone}</span>
                        </div>
                        {fulfillmentType === 'pickup' && pickupTime && (
                          <div className="flex justify-between font-bold text-gray-500">
                            <span>Pickup time</span>
                            <span className="font-black text-gray-800 dark:text-gray-200">{pickupTime}</span>
                          </div>
                        )}
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                        <div className="flex justify-between items-center">
                          <span className="font-black text-gray-700 dark:text-gray-300">{t('common.total')}</span>
                          <span className="text-lg font-black text-orange-500">{totalPrice.toLocaleString()} RWF</span>
                        </div>
                      </div>

                      {orderError && (
                        <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
                          {orderError}
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={validateAndPay}
                        disabled={isProcessing}
                        className="w-full bg-black dark:bg-white dark:text-black text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 text-lg disabled:opacity-50 mb-3"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            Pay {totalPrice.toLocaleString()} RWF
                          </>
                        )}
                      </motion.button>
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full py-3 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                      >
                        ← Back
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* ── SUCCESS SCREEN ── */
                <div className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-simba-orange rounded-full flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-simba-orange/40"
                  >
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h3 className="text-4xl font-black mb-3 tracking-tighter text-gray-900 dark:text-white">Order Placed!</h3>
                  <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${orderSnapshot?.fulfillmentType === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {orderSnapshot?.fulfillmentType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                  </span>
                  <p className="text-gray-500 font-medium text-base mb-1">
                    {orderSnapshot?.fulfillmentType === 'delivery' ? 'We will deliver your order shortly 🏠' : `Ready for pickup${orderSnapshot?.pickupTime ? ` · ${orderSnapshot.pickupTime}` : ''} 🏪`}
                  </p>
                  <button
                    onClick={printInvoice}
                    className="mt-5 mb-4 inline-flex items-center gap-2 bg-gray-900 dark:bg-white dark:text-black text-white font-black px-6 py-3 rounded-2xl hover:opacity-90 transition-all text-sm"
                  >
                    🖨 Download / Print Invoice
                  </button>
                  <p className="text-orange-500 font-black uppercase tracking-widest text-xs animate-pulse">Redirecting to orders...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{t('common.cart')}</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            {items.length} {t('common.items')} in your bag
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-black transition-colors flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-fit"
        >
          <Trash2 size={18} />
          {t('common.clearCart')}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item: import('@/types/product').CartItem) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center transition-all duration-300"
              >
                <div className="relative w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-2xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={item.image || 'https://via.placeholder.com/150x150?text=No+Image'}
                    alt={item.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                <div className="flex-grow min-w-0 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Link href={`/${locale}/product/${item.id}`} className="hover:text-simba-orange dark:hover:text-simba-gold transition-colors">
                      <h3 className="font-black text-gray-900 dark:text-gray-100 text-xl truncate pr-6 tracking-tight">{item.name}</h3>
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors flex-shrink-0 p-1"
                      aria-label={t('common.remove')}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => saveForLater(item)}
                      className="text-[10px] font-black text-simba-orange uppercase tracking-widest border border-simba-orange/40 px-3 py-1 rounded-lg hover:bg-simba-orange hover:text-white transition-all"
                    >
                      Save for later
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-2xl p-1 border border-gray-100 dark:border-gray-700">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => decreaseQuantity(item.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={18} />
                      </motion.button>
                      <span className="w-12 text-center font-black text-gray-900 dark:text-gray-200 text-lg">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => increaseQuantity(item.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded-xl transition-all"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">
                        {item.quantity > 1 ? `${item.price.toLocaleString()} RWF each` : ''}
                      </p>
                      <p className="text-2xl font-black text-simba-orange dark:text-simba-gold tracking-tighter">
                        {(item.price * item.quantity).toLocaleString()} <span className="text-sm">RWF</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-3 text-simba-orange dark:text-simba-gold font-black hover:gap-5 transition-all mt-6 uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} />
            {t('common.continueShopping')}
          </Link>

          {/* Saved for Later shelf */}
          <AnimatePresence>
            {savedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-10"
              >
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
                  Saved for Later <span className="text-gray-400 font-bold text-sm">({savedItems.length})</span>
                </h3>
                <div className="space-y-4">
                  {savedItems.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                        <Image src={item.image || 'https://via.placeholder.com/64'} alt={item.name} fill className="object-contain p-2" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-black text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-simba-orange font-bold text-sm">{item.price.toLocaleString()} RWF</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => moveToCart(item)}
                          className="text-[10px] font-black uppercase tracking-widest text-simba-orange border border-simba-orange px-3 py-1.5 rounded-xl hover:bg-simba-orange hover:text-white transition-all"
                        >
                          Move to Cart
                        </button>
                        <button onClick={() => removeSaved(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 sticky top-28 transition-all"
          >
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">{t('common.orderSummary')}</h2>

            <div className="space-y-5 mb-6">
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>{t('common.subtotal')}</span>
                <span className="text-gray-900 dark:text-gray-100 text-sm font-black">{totalPrice.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">
                <span>{t('common.deliveryFee')}</span>
                <span className="text-simba-orange dark:text-simba-gold font-black text-sm">{t('common.free')}</span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-gray-900 dark:text-white font-black uppercase tracking-tighter text-lg">{t('common.total')}</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-simba-orange dark:text-simba-gold tracking-tighter">
                    {totalPrice.toLocaleString()} <span className="text-sm">RWF</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Minimum order warning */}
            <AnimatePresence>
              {belowMinimum && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"
                >
                  <p className="text-amber-700 dark:text-amber-400 text-xs font-black leading-relaxed">
                    ⚠️ Minimum order is {MIN_ORDER.toLocaleString()} RWF. Add{' '}
                    <span className="text-amber-900 dark:text-amber-300">
                      {(MIN_ORDER - totalPrice).toLocaleString()} RWF
                    </span>{' '}
                    more to proceed.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={belowMinimum ? {} : { scale: 1.02 }}
              whileTap={belowMinimum ? {} : { scale: 0.98 }}
              onClick={belowMinimum ? undefined : handleCheckout}
              className={`w-full font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
                belowMinimum
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
              }`}
            >
              <CreditCard size={22} />
              {t('common.checkout')}
            </motion.button>

            <div className="mt-6 flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <svg className="w-5 h-5 text-simba-orange" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-wider">
                {t('common.taxesNotice')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


