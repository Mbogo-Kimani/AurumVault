import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Loader2, ShieldCheck, Mail, RefreshCcw } from 'lucide-react';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/verify-email', { email, otp });
      return response.data;
    },
    onSuccess: () => {
      showToast('Account successfully verified. You may now enter.', 'success');
      navigate('/login');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || err.response?.data?.msg || 'Verification failed', 'error');
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    },
    onSuccess: () => {
      showToast('New security code successfully dispatched to your email.', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || err.response?.data?.msg || 'Failed to resend code', 'error');
    },
  });

  return (
    <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Verify Identity</h1>
          <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">Enter your registry credentials</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL@ESTATE.COM"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest placeholder:text-luxury-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2 text-center pt-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Security Code</label>
            <input 
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full bg-transparent border-b border-luxury-gray-200 py-6 text-center text-4xl font-serif outline-none focus:border-black transition-colors tracking-[0.5em]"
            />
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending || otp.length < 6 || !email}
              className="w-full btn-gold flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {verifyMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify Account</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending || !email}
              className="w-full flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black py-2 disabled:opacity-50"
            >
              {resendMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
              <span>Resend Security Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
