import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { Mail, User, MessageCircle, Loader2, MapPin, Phone, ArrowRight } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^(07|01)\d{8}$/, 'Phone number must be Kenyan and 10 digits'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await api.post('/messages', data);
      return response.data;
    },
    onSuccess: () => {
      showToast('Inquiry received successfully', 'success');
      reset();
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to send inquiry', 'error');
    }
  });

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto shadow-2xl bg-white border border-luxury-gray-100 flex flex-col md:row overflow-hidden">
          {/* Info Side */}
          <div className="md:w-1/3 bg-black text-white p-12 space-y-12">
            <div>
              <h1 className="text-3xl font-serif uppercase tracking-widest mb-6">Concierge</h1>
              <p className="text-luxury-gray-400 text-sm leading-relaxed">
                Our advisors are at your disposal for any inquiry regarding our collections or bespoke services.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <MapPin className="text-accent mt-1" size={20} />
                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-bold mb-1">Maison AurumVault</h4>
                  <p className="text-luxury-gray-400 text-xs leading-relaxed uppercase tracking-widest">The Gold Plaza, 4th Floor<br />Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="text-accent mt-1" size={20} />
                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-bold mb-1">Privé Line</h4>
                  <p className="text-luxury-gray-400 text-xs leading-relaxed">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mail className="text-accent mt-1" size={20} />
                <div>
                  <h4 className="text-xs uppercase tracking-luxury font-bold mb-1">Inquiries</h4>
                  <p className="text-luxury-gray-400 text-xs leading-relaxed lowercase tracking-widest">concierge@aurumvault.com</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-luxury-gray-800">
               <h4 className="text-[10px] uppercase tracking-luxury font-bold mb-4">Maison Hours</h4>
               <p className="text-[10px] uppercase tracking-widest text-luxury-gray-400">Monday — Saturday: 10:00 - 19:00</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-2/3 p-12 md:p-24 bg-white relative">

            <h2 className="text-2xl font-serif uppercase tracking-widest mb-12">Submit an Inquiry</h2>
            
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

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                    <input 
                      {...register('phone')}
                      placeholder="07XXXXXXXX"
                      className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Subject</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                    <input 
                      {...register('subject')}
                      placeholder="NATURE OF INQUIRY"
                      className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest"
                    />
                  </div>
                  {errors.subject && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.subject.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-500">Your Message</label>
                <div className="relative">
                  <MessageCircle className="absolute left-0 top-3 text-luxury-gray-300" size={18} />
                  <textarea 
                    {...register('message')}
                    placeholder="HOW MAY WE ASSIST YOU?"
                    rows={4}
                    className="w-full bg-transparent border-b border-luxury-gray-200 py-3 pl-8 text-sm outline-none focus:border-black transition-colors uppercase tracking-widest resize-none h-32"
                  ></textarea>
                </div>
                {errors.message && <p className="text-[10px] text-red-500 uppercase tracking-widest">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="btn-primary w-full md:w-auto flex items-center justify-center space-x-3"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>Submit Inquiry</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
