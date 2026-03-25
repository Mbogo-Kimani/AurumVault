import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, MessageSquare, Loader2, Diamond, Gem, Clock } from 'lucide-react';

const quoteSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  productType: z.string().min(2, 'Product type is required'),
  description: z.string().min(20, 'Please provide a detailed description (min 20 chars)'),
  budget: z.string().optional(),
});

type QuoteForm = z.infer<typeof quoteSchema>;

const Quote = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const initialProduct = searchParams.get('product') || '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      productType: initialProduct,
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: QuoteForm) => {
      const response = await api.post('/quotes', data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Quote request submitted successfully', 'success');
      reset();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    }
  });

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent uppercase tracking-luxury text-sm font-bold mb-4 block">Bespoke Collection</span>
            <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-wider mb-6">Request a Private Quotation</h1>
            <p className="text-luxury-gray-500 uppercase tracking-luxury text-xs max-w-2xl mx-auto">
              Our master craftspeople transform your vision into a timeless treasure of incomparable beauty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 px-6">
            <div className="text-center space-y-4">
               <Diamond className="mx-auto text-accent" size={32} />
               <h3 className="text-[10px] uppercase font-bold tracking-luxury">Unmatched Rarity</h3>
               <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">Sourcing the world's most exceptional gemstones.</p>
            </div>
            <div className="text-center space-y-4">
               <Gem className="mx-auto text-accent" size={32} />
               <h3 className="text-[10px] uppercase font-bold tracking-luxury">Artisan Mastery</h3>
               <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">Hand-forged brilliance in our private Kenya atelier.</p>
            </div>
            <div className="text-center space-y-4">
               <Clock className="mx-auto text-accent" size={32} />
               <h3 className="text-[10px] uppercase font-bold tracking-luxury">Timeless Journey</h3>
               <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">A dedicated legacy created specifically for you.</p>
            </div>
          </div>

          <div className="bg-white border border-luxury-gray-100 p-8 md:p-16 relative shadow-sm">

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                    <input 
                      {...register('name')}
                      placeholder="NAME"
                      className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                    <input 
                      {...register('email')}
                      placeholder="EMAIL@ESTATE.COM"
                      className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Piece Type</label>
                  <select 
                    {...register('productType')}
                    className="w-full bg-transparent border-b border-luxury-gray-200 py-3 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                  >
                    <option value="">Select Type</option>
                    <option value="Ring">Signature Ring</option>
                    <option value="Necklace">High Jewelry Necklace</option>
                    <option value="Bracelet">Artisan Bracelet</option>
                    <option value="Watch">Timepiece Commission</option>
                    <option value="Other">Other Bespoke Piece</option>
                  </select>
                  {errors.productType && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.productType.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Estimated Budget (Optional)</label>
                  <input 
                    {...register('budget')}
                    placeholder="E.G. KES 500,000+"
                    className="w-full bg-transparent border-b border-luxury-gray-200 py-3 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Your Vision / Description</label>
                <div className="relative">
                  <MessageSquare className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                  <textarea 
                    {...register('description')}
                    placeholder="DESCRIBE THE LEGACY YOU WISH TO CREATE..."
                    rows={4}
                    className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest resize-none h-32"
                  ></textarea>
                </div>
                {errors.description && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.description.message}</p>}
              </div>

              <div className="flex justify-center">
                <button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="btn-gold px-12 py-5"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin inline mr-3" size={20} /> : 'Request Private Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote;
