import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { showToast } = useToast();

  const handleSubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      await api.post('/subscribers', { email });
      setStatus('success');
      showToast('Welcome to the inner circle.', 'success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('idle');
      showToast(err.response?.data?.message || 'Subscription failed', 'error');
    }
  };

  return (
    <footer className="bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-serif tracking-luxury uppercase mb-8">AurumVault</h2>
          <p className="text-luxury-gray-400 text-sm leading-relaxed mb-8 uppercase tracking-widest text-[10px]">
            Defining excellence in luxury jewelry and gold vault services. Timeless pieces for the modern connoisseur.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-luxury font-bold mb-8 text-accent">Collections</h3>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-luxury-gray-300">
            <li><Link to="/shop?category=Ring" className="hover:text-white transition-colors">Rings</Link></li>
            <li><Link to="/shop?category=Necklace" className="hover:text-white transition-colors">Necklaces</Link></li>
            <li><Link to="/shop?category=Watch" className="hover:text-white transition-colors">Watches</Link></li>
            <li><Link to="/shop?quality=High" className="hover:text-white transition-colors">The Vault Edition</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-luxury font-bold mb-8 text-accent">Customer Care</h3>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-luxury-gray-300">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link to="/quote" className="hover:text-white transition-colors">Custom Quotation</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-luxury font-bold mb-8 text-accent">Newsletter</h3>
          <p className="text-[10px] uppercase tracking-widest text-luxury-gray-300 mb-6 leading-relaxed">Exclusive access to new launches and seasonal vault updates.</p>
          <div className="flex border-b border-luxury-gray-500 pb-2 relative">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'success'}
              className="bg-transparent border-none outline-none text-[10px] w-full uppercase tracking-luxury focus:placeholder-transparent transition-all disabled:opacity-50"
            />
            <button 
              onClick={handleSubscribe}
              disabled={status !== 'idle' || !email}
              className="text-[10px] uppercase tracking-luxury font-bold hover:text-accent transition-colors disabled:opacity-30"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" size={14} /> : 
               status === 'success' ? <Check className="text-green-500" size={14} /> : 'Join'}
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-24 border-t border-luxury-gray-800 pt-8 flex flex-col md:row justify-between items-center text-[10px] uppercase tracking-luxury text-luxury-gray-500">
        <p>&copy; 2026 AurumVault Luxury. All Rights Reserved.</p>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">X</a>
          <a href="#" className="hover:text-white transition-colors">Pinterest</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
