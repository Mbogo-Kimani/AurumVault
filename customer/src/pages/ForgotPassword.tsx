import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  otp: z.string().length(6, 'Security code must be exactly 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');

  const { register: registerRequest, handleSubmit: handleRequestSubmit, formState: { errors: requestErrors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const { register: registerReset, handleSubmit: handleResetSubmit, formState: { errors: resetErrors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const requestMutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      const response = await api.post('/auth/request-reset', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep('reset');
      showToast('Password reset code dispatched securely', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.msg || err.response?.data?.message || 'Failed to request password reset', 'error');
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetForm) => {
      const response = await api.post('/auth/reset-password', { email, otp: data.otp, newPassword: data.newPassword });
      return response.data;
    },
    onSuccess: () => {
      showToast('Vault credentials securely updated', 'success');
      navigate('/login');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.msg || err.response?.data?.message || 'Failed to reset password', 'error');
    },
  });

  if (step === 'reset') {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Reset Credentials</h1>
            <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">We sent a security code to {email}</p>
          </div>

          <form onSubmit={handleResetSubmit((data) => resetMutation.mutate(data))} className="space-y-8">
            <div className="space-y-2 text-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Security Code</label>
              <input 
                {...registerReset('otp')}
                maxLength={6}
                placeholder="000000"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-6 text-center text-4xl font-serif outline-none focus:border-black transition-colors tracking-[0.5em]"
              />
              {resetErrors.otp && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{resetErrors.otp.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">New Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                <input 
                  {...registerReset('newPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
              {resetErrors.newPassword && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{resetErrors.newPassword.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full btn-gold flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {resetMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <ShieldCheck size={18} />
                  <span>Secure New Password</span>
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black"
            >
              Request a new code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Password Recovery</h1>
          <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">Enter your email to regain vault access</p>
        </div>

        <form onSubmit={handleRequestSubmit((data) => requestMutation.mutate(data))} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...registerRequest('email')}
                type="email"
                placeholder="EMAIL@EXAMPLE.COM"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
              />
            </div>
            {requestErrors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{requestErrors.email.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={requestMutation.isPending}
            className="w-full btn-primary flex items-center justify-center space-x-3"
          >
            {requestMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-luxury-gray-400 uppercase tracking-luxury mb-4">Remembered your credentials?</p>
          <Link to="/login" className="text-xs uppercase tracking-luxury font-bold border-b border-black pb-1 hover:text-accent hover:border-accent transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
