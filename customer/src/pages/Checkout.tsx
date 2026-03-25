import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Phone, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('delivery');
  const [deliveryDetails, setDeliveryDetails] = useState({ 
    address: (user as any)?.address || '', 
    city: (user as any)?.city || '', 
    note: '' 
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // STK Polling Effect
  React.useEffect(() => {
    if (!checkoutRequestID || !isPolling) return;

    const startTime = Date.now();
    const TIMEOUT_MS = 60000; // 60 seconds

    const interval = setInterval(async () => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        setIsPolling(false);
        setCheckoutRequestID(null);
        showToast('Payment request timed out. Please try again.', 'error');
        clearInterval(interval);
        return;
      }

      try {
        const res = await api.get(`/payments/stk/${checkoutRequestID}/status`);
        const { status, reason } = res.data;

        if (status === 'Success') {
          setIsPolling(false);
          setSuccess(true);
          showToast('Payment successful', 'success');
          clearCart();
        } else if (status === 'Failed') {
          setIsPolling(false);
          setCheckoutRequestID(null);
          showToast(`Payment failed: ${reason || 'Transaction cancelled'}`, 'error');
        }
        // If Pending, do nothing, keep polling
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [checkoutRequestID, isPolling, clearCart, showToast]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (fulfillmentType === 'delivery' && (!deliveryDetails.address || !deliveryDetails.city)) {
        setShowAddressModal(true);
        throw new Error('Please provide delivery details');
      }

      showToast('Initiating secure transaction...', 'loading');
      const saleResponse = await api.post('/payments/stk', {
        amount: total,
        phoneNumber,
        buyerName: user?.name,
        fulfillmentType,
        deliveryDetails: fulfillmentType === 'delivery' ? deliveryDetails : undefined,
        items: cart.map(item => ({
          productId: item._id,
          productName: item.name,
          quantity: item.quantity,
          price: item.salePrice || item.price
        }))
      });
      return saleResponse.data;
    },
    onSuccess: (data: any) => {
      if (data.checkoutRequestID) {
        setCheckoutRequestID(data.checkoutRequestID);
        setIsPolling(true);
        showToast('Please enter your M-Pesa PIN on your phone...', 'loading');
      } else {
        // Fallback if backend didn't return ID (shouldn't happen with new logic)
        setSuccess(true);
        showToast('Payment request sent successfully', 'success');
        clearCart();
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error 
        ? (typeof err.response.data.error === 'object' ? JSON.stringify(err.response.data.error) : err.response.data.error)
        : (err.response?.data?.message || err.message || 'Payment initiation failed');
      showToast(errorMsg, 'error');
    }
  });

  if (cart.length === 0 && !success) {
    return (
      <div className="pt-40 pb-24 min-h-screen container mx-auto px-6 text-center">
        <ShoppingBag className="mx-auto text-luxury-gray-200 mb-8" size={64} />
        <h2 className="text-2xl font-serif uppercase mb-8">Your bag is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Discover the Collections</button>
      </div>
    );
  }

  if (success) {
    return (
       <div className="pt-40 pb-24 min-h-screen container mx-auto px-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-12">
          <ShieldCheck className="text-white" size={40} />
        </div>
        <h1 className="text-4xl font-serif uppercase mb-6">Reservation Secured</h1>
        
        <div className="max-w-md mx-auto mb-12 bg-luxury-gray-50 p-8 border border-luxury-gray-100">
          {fulfillmentType === 'pickup' ? (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-accent">Collection Portfolio</p>
              <h3 className="text-lg font-serif uppercase">AurumVault Private Atelier</h3>
              <p className="text-xs text-luxury-gray-500 uppercase tracking-luxury leading-relaxed">
                123 Luxury Square, Nairobi<br/>
                Hours: Mon-Sat, 10:00 AM - 6:00 PM
              </p>
              <p className="text-[10px] text-luxury-gray-400 mt-4 italic uppercase tracking-widest">Please present your transaction ID upon arrival.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest font-bold text-accent">Vault Dispatch</p>
              <h3 className="text-lg font-serif uppercase">Home Delivery</h3>
              <p className="text-xs text-luxury-gray-500 uppercase tracking-luxury leading-relaxed">
                Your acquisition will be dispatched to:<br/>
                {deliveryDetails.address}, {deliveryDetails.city}
              </p>
              <p className="text-[10px] text-luxury-gray-400 mt-4 italic uppercase tracking-widest">Delivery timeline: 24-48 private vault hours.</p>
            </div>
          )}
        </div>

        <p className="text-luxury-gray-500 uppercase tracking-luxury text-[10px] max-w-sm mx-auto mb-12">
          We have sent a secure STK Push and a detailed acquisition confirmation to your registered email.
        </p>
        <button onClick={() => navigate('/profile')} className="btn-outline">View Order Status</button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          {/* Bag Summary */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-serif uppercase tracking-widest mb-12 border-b border-luxury-gray-100 pb-4">Secure Checkout</h1>
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={item._id} className="flex space-x-6 py-6 border-b border-luxury-gray-50">
                  <div className="w-24 h-32 bg-luxury-gray-50 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif uppercase text-lg mb-2">{item.name}</h3>
                      <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm tracking-luxury">
                      KES {((item.salePrice || item.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:w-1/3">
            <div className="bg-luxury-gray-50 p-8 border border-luxury-gray-100 shadow-sm">
              <h2 className="text-xs uppercase tracking-luxury font-bold mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8 border-b border-luxury-gray-200 pb-8">
                <div className="flex justify-between text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest">
                  <span>Vault Delivery</span>
                  <span className="text-accent font-bold italic">Complimentary</span>
                </div>
              </div>

              <div className="flex justify-between mb-12">
                <span className="text-sm uppercase tracking-luxury font-bold">Total</span>
                <span className="text-lg font-serif">KES {total.toLocaleString()}</span>
              </div>

              <div className="space-y-8">
                {/* Fulfillment Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Fulfillment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFulfillmentType('delivery')}
                      className={`p-4 border text-[10px] uppercase tracking-widest flex flex-col items-center transition-all ${fulfillmentType === 'delivery' ? 'border-black bg-black text-white' : 'border-luxury-gray-200 text-luxury-gray-500 hover:border-black'}`}
                    >
                      <ArrowRight size={16} className="mb-2" />
                      Home Delivery
                    </button>
                    <button 
                      onClick={() => setFulfillmentType('pickup')}
                      className={`p-4 border text-[10px] uppercase tracking-widest flex flex-col items-center transition-all ${fulfillmentType === 'pickup' ? 'border-black bg-black text-white' : 'border-luxury-gray-200 text-luxury-gray-500 hover:border-black'}`}
                    >
                      <ShoppingBag size={16} className="mb-2" />
                      Store Pick Up
                    </button>
                  </div>
                </div>

                {fulfillmentType === 'delivery' && (
                  <div className="p-4 bg-white border border-luxury-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest font-bold text-accent mb-1">Shipping To</p>
                      <p className="text-xs uppercase tracking-luxury truncate max-w-[150px]">
                        {deliveryDetails.address ? `${deliveryDetails.address}, ${deliveryDetails.city}` : 'No address provided'}
                      </p>
                    </div>
                    <button onClick={() => setShowAddressModal(true)} className="text-[10px] uppercase tracking-widest font-bold border-b border-black">
                      {deliveryDetails.address ? 'Edit' : 'Add'}
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">M-Pesa Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-3 text-luxury-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="2547XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-transparent border-b border-luxury-gray-300 py-3 pl-8 text-sm outline-none focus:border-black transition-colors tracking-widest"
                    />
                  </div>
                </div>

                {!user ? (
                   <div className="text-center space-y-4">
                    <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">Login required for secure checkout</p>
                    <button onClick={() => navigate('/login')} className="w-full btn-primary">Sign In to Continue</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || isPolling || !phoneNumber}
                    className="w-full btn-gold flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {mutation.isPending || isPolling ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        <span>Pay via M-Pesa</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center space-x-2 text-[8px] text-luxury-gray-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-accent" />
                <span>Encrypted secure transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md p-12 border border-luxury-gray-100 shadow-2xl relative">
            <h2 className="text-2xl font-serif uppercase tracking-widest mb-8 text-center">Delivery Details</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500 block mb-2">Street Address</label>
                <input 
                  type="text"
                  value={deliveryDetails.address}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                  className="w-full border-b border-luxury-gray-200 py-2 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                  placeholder="HOUSE NO, STREET NAME"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500 block mb-2">City / Area</label>
                <input 
                  type="text"
                  value={deliveryDetails.city}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                  className="w-full border-b border-luxury-gray-200 py-2 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                  placeholder="NAIROBI, KENYA"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500 block mb-2">Delivery Note (Optional)</label>
                <textarea 
                  value={deliveryDetails.note}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, note: e.target.value })}
                  className="w-full border-b border-luxury-gray-200 py-2 text-sm outline-none focus:border-black transition-colors h-20 resize-none uppercase tracking-widest"
                  placeholder="EG. DOOR BELL 4B, GATE CODE 1234"
                />
              </div>
              <button 
                onClick={() => {
                  if (deliveryDetails.address && deliveryDetails.city) setShowAddressModal(false);
                  else showToast('Please fill in required fields', 'error');
                }}
                className="w-full btn-primary py-4"
              >
                Confirm Destination
              </button>
              <button onClick={() => setShowAddressModal(false)} className="w-full text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black mt-4">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
