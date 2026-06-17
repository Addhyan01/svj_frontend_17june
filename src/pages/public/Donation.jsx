import React, { useState, useCallback } from 'react';
import { donationAPI } from '../../api/services';

// Dynamically load the Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donation() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', pan: '', amount: '',
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null); // { name, amount }
  const [error, setError]       = useState('');

  const quickAmounts = [500, 1100, 2100, 5100];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleQuickAmountClick = (amount) => {
    setFormData((prev) => ({ ...prev, amount: amount.toString() }));
    setError('');
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!formData.name || !formData.email || !formData.phone || !formData.amount) {
      setError('Please fill all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (Number(formData.amount) < 1) {
      setError('Donation amount must be at least ₹1.');
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError('Failed to load payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const { data } = await donationAPI.createOrder({
        name:   formData.name,
        email:  formData.email,
        phone:  formData.phone,
        pan:    formData.pan,
        amount: Number(formData.amount),
      });

      if (!data.success) {
        setError(data.message || 'Could not initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount:      data.amount,       // paise from backend
        currency:    data.currency,
        name:        'Sabka Vikas Jyati',
        description: 'Donation',
        order_id:    data.orderId,
        prefill: {
          name:    formData.name,
          email:   formData.email,
          contact: formData.phone,
        },
        theme: { color: '#3A7D44' },

        handler: async (response) => {
          // 4. Verify payment on backend
          try {
            const verifyRes = await donationAPI.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              setSuccess({ name: formData.name, amount: formData.amount });
              setFormData({ name: '', email: '', phone: '', pan: '', amount: '' });
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Payment verification error. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment was cancelled. You can try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Donation error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setLoading(false);
    }
  }, [formData]);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 px-4 flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-8 px-8 text-white">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-black tracking-tight">Donation Successful!</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-gray-700 font-semibold text-lg">
              Thank you, <span className="text-emerald-700">{success.name}</span>!
            </p>
            <p className="text-gray-500 text-sm">
              Your donation of <span className="font-bold text-gray-800">₹{success.amount}</span> has been received.
              A confirmation will be sent to your email.
            </p>
            <p className="text-xs text-gray-400 italic">"गाँव गाँव खुशी, देश खुशहाल"</p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-4 w-full py-3 rounded-xl font-bold text-white transition hover:-translate-y-0.5"
              style={{ backgroundColor: '#3A7D44' }}
            >
              Donate Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Donation form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition duration-300">

        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-6 px-8 text-center text-white">
          <h2 className="text-2xl font-black tracking-tight">Direct Donation Portal</h2>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mt-1">
            "गाँव गाँव खुशी, देश खुशहाल"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Quick amount chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Choose Amount (₹)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickAmountClick(amt)}
                  className={`py-2 px-1 text-center font-extrabold rounded-xl text-sm transition border ${
                    formData.amount === amt.toString()
                      ? 'border-[#3A7D44] bg-emerald-50 text-[#3A7D44]'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
              Or Enter Custom Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold text-sm">₹</span>
              </div>
              <input
                type="number"
                name="amount"
                required
                min="1"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Custom Amount दर्ज करें"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A7D44]/20 focus:border-[#3A7D44] font-extrabold text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Personal info */}
          <div className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Apna poora naam likhein"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A7D44]/20 focus:border-[#3A7D44] text-sm font-semibold text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A7D44]/20 focus:border-[#3A7D44] text-sm font-semibold text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Phone + PAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A7D44]/20 focus:border-[#3A7D44] text-sm font-semibold text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                  PAN Number <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="pan"
                  maxLength="10"
                  value={formData.pan}
                  onChange={handleInputChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3A7D44]/20 focus:border-[#3A7D44] text-sm font-semibold text-gray-800 uppercase placeholder-gray-400 tracking-wider"
                />
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-4 px-4 rounded-xl shadow-lg transition duration-150 transform hover:-translate-y-0.5 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3A7D44' }}
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <svg className="h-5 w-5 text-emerald-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Proceed to Secure Payment</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400 font-medium leading-normal">
            🛡️ Powered by Razorpay · 256-bit SSL encrypted · Your transaction is fully secured.
          </p>

        </form>
      </div>
    </div>
  );
}
