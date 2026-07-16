import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Smartphone,
  Shield,
  Lock,
  CheckCircle2,
  X,
  Sparkles,
  Mail,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseItem: {
    type: 'plan' | 'product';
    id: string;
    name: string;
    price: string;
    brandOrCategory?: string;
    details?: string;
  } | null;
  onSuccess: (receipt: {
    transactionId: string;
    method: 'Stripe' | 'Easypaisa';
    amount: string;
    date: string;
    itemType: 'plan' | 'product';
    itemId: string;
    itemName: string;
  }) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  purchaseItem,
  onSuccess
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'easypaisa'>('stripe');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Stripe Card state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isFlipped, setIsFlipped] = useState(false); // flips card for CVC

  // Easypaisa Phone State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Success Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<any | null>(null);

  // Clear state on open
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setFullName('');
      setPostalCode('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setIsFlipped(false);
      setMobileNumber('');
      setOtpSent(false);
      setOtpCode('');
      setIsProcessing(false);
      setProcessStep('');
      setPaymentError(null);
      setShowReceipt(false);
      setReceiptDetails(null);
    }
  }, [isOpen]);

  if (!isOpen || !purchaseItem) return null;

  // Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Digits only
    if (value.length > 16) value = value.slice(0, 16);
    
    // Formatting with spaces (e.g. 1234 5678 1234 5678)
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCvc(value);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Formatting PK number (e.g. 0300-1234567)
    if (value.length > 4) {
      setMobileNumber(`${value.slice(0, 4)}-${value.slice(4)}`);
    } else {
      setMobileNumber(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setOtpCode(value);
  };

  // Card Brand Detector
  const detectCardBrand = (num: string) => {
    const raw = num.replace(/\s+/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (raw.match(/^(5[1-5]|2[2-7])/)) return 'Mastercard';
    if (raw.startsWith('34') || raw.startsWith('37')) return 'American Express';
    if (raw.startsWith('6')) return 'Discover';
    return 'Generic Card';
  };

  const cardBrand = detectCardBrand(cardNumber);

  // Validate Email
  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  // Trigger Easypaisa OTP
  const triggerEasypaisaOTP = () => {
    setPaymentError(null);
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('03')) {
      setPaymentError('Please enter a valid 11-digit Easypaisa mobile number (03xx-xxxxxxx).');
      return;
    }
    if (!validateEmail(email)) {
      setPaymentError('Please provide a valid email address for receipt distribution.');
      return;
    }
    if (!fullName.trim()) {
      setPaymentError('Please enter your full account holder name.');
      return;
    }

    setIsProcessing(true);
    setProcessStep('Connecting with Easypaisa servers...');
    
    setTimeout(() => {
      setProcessStep('Sending secure 4-digit code to wallet...');
      setTimeout(() => {
        setIsProcessing(false);
        setOtpSent(true);
        setProcessStep('');
      }, 1200);
    }, 1500);
  };

  // Process Final payment check
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Common check
    if (!validateEmail(email)) {
      setPaymentError('Please provide a valid email address for your payment receipt.');
      return;
    }
    if (!fullName.trim()) {
      setPaymentError('Please provide your full billing name.');
      return;
    }

    if (paymentMethod === 'stripe') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      const cleanCvc = cvc.replace(/\D/g, '');
      if (cleanCard.length < 15 || cleanCard.length > 16) {
        setPaymentError('Please enter a valid Credit or Debit card number.');
        return;
      }
      if (expiry.length !== 5 || !expiry.includes('/')) {
        setPaymentError('Please enter a valid expiration date (MM/YY).');
        return;
      }
      const [month, year] = expiry.split('/');
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        setPaymentError('Card expiration month is invalid (must be 01 - 12).');
        return;
      }
      if (cleanCvc.length < 3) {
        setPaymentError('Please provide a valid card security code (CVC/CVV).');
        return;
      }
      if (!postalCode.trim()) {
        setPaymentError('Please enter your billing Postal / ZIP Code.');
        return;
      }
    } else {
      // Easypaisa PIN validation
      if (otpCode.length !== 4) {
        setPaymentError('Please enter the 4-digit OTP/PIN code sent to your mobile wallet.');
        return;
      }
    }

    setIsProcessing(true);
    setIsFlipped(false);

    // Steps simulation for premium look
    if (paymentMethod === 'stripe') {
      setProcessStep('Verifying card secure elements...');
      setTimeout(() => {
        setProcessStep('Executing Stripe PaymentIntent transaction token...');
        setTimeout(() => {
          setProcessStep('Finalizing vault clearances & acquiring approval code...');
          setTimeout(() => {
            completeSuccessfulTransaction();
          }, 1200);
        }, 1405);
      }, 1500);
    } else {
      setProcessStep('Validating mobile secure wallet PIN code...');
      setTimeout(() => {
        setProcessStep(`Requesting PKR payment token equivalent of ${purchaseItem.price}...`);
        setTimeout(() => {
          setProcessStep('Finalizing safe account deduction & transaction receipts...');
          setTimeout(() => {
            completeSuccessfulTransaction();
          }, 1200);
        }, 1400);
      }, 1300);
    }
  };

  const completeSuccessfulTransaction = () => {
    const rawAmount = purchaseItem.price;
    const txId = (paymentMethod === 'stripe' ? 'ch_stripe_' : 'tx_ep_') + Math.random().toString(36).substring(2, 11).toUpperCase();
    const payDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const receipt = {
      transactionId: txId,
      method: (paymentMethod === 'stripe' ? 'Stripe' : 'Easypaisa') as 'Stripe' | 'Easypaisa',
      amount: rawAmount,
      date: payDate,
      itemType: purchaseItem.type,
      itemId: purchaseItem.id,
      itemName: purchaseItem.name
    };

    setReceiptDetails(receipt);
    setIsProcessing(false);
    setProcessStep('');
    setShowReceipt(true);

    // Call successful callback
    onSuccess(receipt);
  };

  return (
    <AnimatePresence>
      <div 
        id="payment-portal-backdrop"
        className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          id="payment-portal-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
        >
          {/* Header */}
          <div className="bg-zinc-50 border-b border-zinc-250 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gold-500/10 text-gold-700 p-2 rounded-xl">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Secure payment ledger</span>
                <h3 className="text-lg font-display font-black text-zinc-900 uppercase tracking-tight">Checkout Portal</h3>
              </div>
            </div>
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className="p-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer border border-zinc-200"
              disabled={isProcessing}
            >
              <X size={18} />
            </button>
          </div>

          {!showReceipt ? (
            <div className="p-6 md:p-8 space-y-6">
              {/* Summary Box */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                    {purchaseItem.type === 'plan' ? 'Selected Membership Plan' : 'Selected Premium Supplement'}
                  </span>
                  <h4 className="text-zinc-900 font-display text-lg uppercase font-black mt-0.5">
                    {purchaseItem.name}
                  </h4>
                  {purchaseItem.brandOrCategory && (
                    <span className="text-xs text-zinc-500 font-mono italic">
                      {purchaseItem.brandOrCategory}
                    </span>
                  )}
                </div>
                
                <div className="bg-white border border-zinc-200 px-5 py-3 rounded-xl text-right shadow-sm">
                  <span className="text-[10px] font-mono text-zinc-500 block font-bold">Total Bill:</span>
                  <span className="text-2xl font-display font-black text-gold-700 tracking-tight">
                    {purchaseItem.price}
                  </span>
                </div>
              </div>

              {/* Methods Switcher */}
              {!isProcessing && !otpSent && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('stripe');
                      setPaymentError(null);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-display transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-gold-600 bg-amber-50/55 text-gold-800 font-bold shadow-sm'
                        : 'border-zinc-200 bg-zinc-50/50 text-zinc-550 hover:text-zinc-900 hover:border-zinc-300'
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-gold-700" />
                    <span className="text-[11px] uppercase tracking-wider">Credit/Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('easypaisa');
                      setPaymentError(null);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-display transition-all ${
                      paymentMethod === 'easypaisa'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold shadow-sm'
                        : 'border-zinc-200 bg-zinc-50/50 text-zinc-550 hover:text-zinc-900 hover:border-zinc-300'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 text-emerald-600" />
                    <span className="text-[11px] uppercase tracking-wider">Easypaisa Wallet</span>
                  </button>
                </div>
              )}

              {/* Loader overlay inside form */}
              {isProcessing && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <Loader className="h-10 w-10 text-gold-600 animate-spin" />
                  <div className="space-y-1">
                    <h5 className="text-zinc-900 font-mono text-xs uppercase tracking-widest font-extrabold">Transaction Crypt Processing</h5>
                    <p className="text-zinc-500 text-xs font-sans font-normal max-w-sm">
                      {processStep || 'Acquiring dynamic authorization clearances securely...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Checkout Form */}
              {!isProcessing && (
                <form onSubmit={handleSubmitPayment} className="space-y-5 text-left">
                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h6 className="text-red-800 font-display text-xs font-bold uppercase tracking-wide">Validation Discrepancy</h6>
                        <p className="text-red-700 text-[11px] font-sans mt-0.5 leading-relaxed">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {!otpSent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                          Billing Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="email"
                            required
                            placeholder="you@domain.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-sans shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                          {paymentMethod === 'stripe' ? 'Cardholder Full Name' : 'Account Holder Title'}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            required
                            placeholder="Muhammad Ali"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-sans shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stripe Dynamic Forms */}
                  {paymentMethod === 'stripe' && !otpSent && (
                    <div className="space-y-5">
                      {/* Animated 3D Credit Card Widget */}
                      <div className="perspective-1000 py-2 flex justify-center">
                        <motion.div
                          id="interactive-credit-card-body"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                          transition={{ duration: 0.6 }}
                          className="relative w-full max-w-[340px] h-[200px] rounded-2xl p-6 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-800 text-white shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer preserve-3d"
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl" />

                          {/* Front Side */}
                          <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden">
                            {/* Chip & Brand */}
                            <div className="flex items-start justify-between">
                              <div className="w-10 h-7 rounded-md bg-gradient-to-r from-yellow-600 to-yellow-400/80 flex items-center justify-center overflow-hidden">
                                <div className="border border-black/10 w-8 h-5 grid grid-cols-3 grid-rows-3" />
                              </div>
                              <span className="font-mono text-[10px] text-gold-500 font-bold uppercase tracking-wider block bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                                {cardBrand}
                              </span>
                            </div>

                            {/* Card Number */}
                            <div className="font-mono text-base md:text-lg tracking-widest text-center py-2 text-zinc-100">
                              {cardNumber || '•••• •••• •••• ••••'}
                            </div>

                            {/* Card specs footer */}
                            <div className="flex items-end justify-between font-mono">
                              <div>
                                <span className="text-[7px] text-zinc-400 block uppercase">Cardholder</span>
                                <span className="text-[10px] text-white font-medium block truncate max-w-[140px]">
                                  {fullName.toUpperCase() || 'YOUR NAME'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[7px] text-zinc-400 block uppercase">Expires</span>
                                <span className="text-[10px] text-white font-medium block">
                                  {expiry || 'MM/YY'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Back Side */}
                          <div className="absolute inset-0 p-6 flex flex-col justify-between bg-zinc-950 border border-zinc-800 rounded-2xl rotate-y-180 backface-hidden">
                            {/* Black Magnetic Strip */}
                            <div className="absolute top-5 left-0 right-0 h-10 bg-zinc-900" />
                            
                            <div className="mt-10 space-y-4">
                              {/* Signature strip */}
                              <div className="flex items-center gap-2">
                                <div className="h-8 bg-zinc-900 border border-zinc-800 rounded flex-grow px-2 flex items-center justify-end">
                                  <span className="text-[10px] text-zinc-500 font-mono italic select-none">Auth signature</span>
                                </div>
                                <div className="h-8 w-12 bg-white text-zinc-950 font-mono text-xs flex items-center justify-center font-bold rounded">
                                  {cvc || '•••'}
                                </div>
                              </div>
                              <p className="text-[7px] text-zinc-500 text-center font-mono leading-tight">
                                This card is verified. Dedicated sports medicine adaptation compounds in Sector 9, Islamabad. Fitsport global transaction network limit clearances.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        {/* Card Number Input */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                            Credit / Debit Card Number
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              required
                              placeholder="4242 4242 4242 4242"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              onFocus={() => setIsFlipped(false)}
                              className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-mono shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Expiry */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                              Expiry Date
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <input
                                type="text"
                                required
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={handleExpiryChange}
                                onFocus={() => setIsFlipped(false)}
                                className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-mono shadow-sm"
                              />
                            </div>
                          </div>

                          {/* Cvc */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                              Security Code (CVC)
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                              <input
                                type="text"
                                required
                                placeholder="123"
                                value={cvc}
                                onChange={handleCvcChange}
                                onFocus={() => setIsFlipped(true)}
                                onBlur={() => setIsFlipped(false)}
                                className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-mono shadow-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Postal Code */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                            Billing Postal / Zip Code
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              required
                              placeholder="44000"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-sans shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Easypaisa Phone Entry Forms */}
                  {paymentMethod === 'easypaisa' && !otpSent && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-4 rounded-xl text-xs space-y-1">
                        <span className="font-mono font-bold uppercase tracking-wider text-[10px] block">Easypaisa Mobile Wallet Link</span>
                        <p className="font-sans font-light">Payments will generate an online push request to your secure Easypaisa Application. Please enter your Pakistani carrier number (03xx-xxxxxxx).</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                          Easypaisa Account Wallet Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            required
                            placeholder="0300-1234567"
                            value={mobileNumber}
                            onChange={handleMobileNumberChange}
                            className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-mono shadow-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={triggerEasypaisaOTP}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-display text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors text-center shadow-sm"
                      >
                        Request Mobile OTP/Code
                      </button>
                    </div>
                  )}

                  {/* OTP Authenticator Gate */}
                  {otpSent && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs space-y-1.5">
                        <span className="font-mono font-bold uppercase tracking-wider block text-[10px]">Verification Code Dispatched</span>
                        <p className="font-sans">We have sent a simulated 4-digit security code to mobile ending in <b>{mobileNumber.slice(-4)}</b>. Enter the PIN or bypass with any four digits for immediate sandbox approval.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">
                          4-Digit Security OTP / Code
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          <input
                            type="text"
                            required
                            placeholder="••••"
                            value={otpCode}
                            onChange={handleOtpChange}
                            className="bg-white border border-zinc-250 rounded-xl px-10 py-3.5 text-xs w-full text-center text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 hover:border-zinc-300 transition-all font-mono tracking-[1em] shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3.5 rounded-xl font-display text-xs uppercase font-bold tracking-wider cursor-pointer text-center border border-zinc-200"
                        >
                          Change Number
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gold-600 hover:bg-zinc-900 hover:text-white text-zinc-900 py-3.5 rounded-xl font-display text-xs uppercase font-extrabold tracking-wider cursor-pointer text-center shadow-sm transition-all"
                        >
                          Verify & Pay {purchaseItem.price}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submission CTA for Stripe */}
                  {paymentMethod === 'stripe' && !otpSent && (
                    <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                        <Lock size={12} className="text-gold-600" />
                        <span>AES 256-Bit SSL Encrypted Connections</span>
                      </div>
                      
                      <button
                        type="submit"
                        className="bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white px-6 py-3.5 rounded-xl font-display text-xs uppercase font-bold tracking-wider cursor-pointer transition-all shadow-md"
                      >
                        Authorize & Pay {purchaseItem.price}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          ) : (
            // Success Receipt View
            <div className="p-6 md:p-8 space-y-6 text-center select-text">
              <div className="flex justify-center">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest font-extrabold block">Transaction Clear</span>
                <h3 className="text-2xl font-display font-black text-zinc-900 uppercase tracking-tight">Payment Successfully Completed</h3>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto leading-relaxed">
                  Your billing transaction was approved and recorded in the local network log. A receipt copy was sent to <span className="text-zinc-800 underline font-bold">{email}</span>.
                </p>
              </div>

              {/* Physical Receipt styling */}
              <div className="bg-zinc-50 border border-zinc-250 rounded-2xl p-6 text-left relative overflow-hidden font-mono space-y-4 shadow-inner">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-gold-500/5 rounded-full" />
                
                <div className="border-b border-dashed border-zinc-300 pb-3 flex justify-between text-[11px] text-zinc-500">
                  <span>FIT-Z COMPOUND RECEIPT</span>
                  <span>SECTOR 9, ISLAMABAD</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Transaction ID:</span>
                    <span className="text-zinc-900 font-bold">{receiptDetails?.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Authorized Gateway:</span>
                    <span className="text-gold-700 font-bold uppercase">{receiptDetails?.method} Payments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Billed Name:</span>
                    <span className="text-zinc-800 font-bold">{fullName}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-3">
                    <span className="text-zinc-550">{purchaseItem.type === 'plan' ? 'Purchased Plan:' : 'Purchased item:'}</span>
                    <span className="text-zinc-900 uppercase font-display font-black text-[11px] truncate max-w-[200px]">{purchaseItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Date Timestamp:</span>
                    <span className="text-zinc-800 text-[11px] font-bold">{receiptDetails?.date}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-3 items-center">
                    <span className="text-zinc-750 font-extrabold">Total Amount Charge:</span>
                    <span className="text-lg text-gold-700 font-display font-black">{receiptDetails?.amount}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-zinc-300 pt-3 text-center text-[10px] text-zinc-400">
                  <span>THANK YOU FOR YOUR RE REGIME PROGRESSION INTERESTS • FITZONE CO.</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="checkout-success-close-btn"
                  onClick={onClose}
                  className="w-full bg-zinc-900 hover:bg-gold-600 hover:text-zinc-950 text-white py-4 rounded-xl font-display text-xs uppercase font-bold tracking-wider transition-all cursor-pointer text-center shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
