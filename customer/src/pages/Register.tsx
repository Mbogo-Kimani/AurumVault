import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep('otp');
      showToast('Security code dispatched', 'success');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || err.response?.data?.msg || 'Registration failed', 'error');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/verify-email', { email, otp });
      return response.data;
    },
    onSuccess: () => {
      showToast('Account successfully verified', 'success');
      navigate('/login');
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || err.response?.data?.msg || 'Verification failed', 'error');
    },
  });

  if (step === 'otp') {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Verify Identity</h1>
            <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">We've sent a code to {email}</p>
          </div>


          <div className="space-y-8">
            <div className="space-y-2 text-center">
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

            <button 
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending || otp.length < 6}
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
              onClick={() => setStep('register')}
              className="w-full text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black"
            >
              Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Join the Vault</h1>
          <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">Become a member of our exclusive collector circle</p>
        </div>


        <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Full Name</label>
            <div className="relative">
              <User className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...register('name')}
                placeholder="YOUR DISTINGUISHED NAME"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest placeholder:text-luxury-gray-200"
              />
            </div>
            {errors.name && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...register('email')}
                type="email"
                placeholder="EMAIL@ESTATE.COM"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest placeholder:text-luxury-gray-200"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors"
                autoComplete="new-password"
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full btn-primary flex items-center justify-center space-x-3"
          >
             {registerMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Enter Registry</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-luxury-gray-400 uppercase tracking-luxury mb-4">Already a member?</p>
          <Link to="/login" className="text-xs uppercase tracking-luxury font-bold border-b border-black pb-1 hover:text-accent hover:border-accent transition-colors">
            Access your existing vault
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
