import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      showToast('Welcome back to the Vault', 'success');
      navigate('/');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.response?.data?.msg || 'Authentication failed';
      if (err.response?.status === 401 && errMsg.includes('Please verify your email')) {
        showToast('You must verify your identity first. Redirecting to registry confirmation...', 'error');
        navigate('/verify-email', { state: { email: mutation.variables?.email } });
      } else {
        showToast(errMsg, 'error');
      }
    },
  });

  return (
    <div className="pt-40 pb-24 min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif uppercase tracking-widest mb-4">Welcome Back</h1>
          <p className="text-luxury-gray-400 text-xs uppercase tracking-luxury">Enter your credentials to access your vault</p>
        </div>


        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...register('email')}
                type="email"
                placeholder="EMAIL@EXAMPLE.COM"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Password</label>
              <Link to="/forgot-password"  className="text-[10px] uppercase tracking-luxury text-luxury-gray-400 hover:text-black">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
              <input 
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 uppercase tracking-widest mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full btn-primary flex items-center justify-center space-x-3"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-luxury-gray-400 uppercase tracking-luxury mb-4">Don't have an account?</p>
          <Link to="/register" className="text-xs uppercase tracking-luxury font-bold border-b border-black pb-1 hover:text-accent hover:border-accent transition-colors">
            Create an entry to the vault
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
