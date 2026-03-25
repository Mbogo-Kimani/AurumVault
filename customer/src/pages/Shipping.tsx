import { Truck, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-serif uppercase tracking-widest mb-12 border-b border-luxury-gray-100 pb-8 text-center">Shipping & Returns</h1>
        
        <div className="space-y-16">
          {/* Shipping Section */}
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-luxury-gray-50 rounded-full">
                <Truck size={24} className="text-accent" />
              </div>
              <h2 className="text-xl font-serif uppercase tracking-widest">White-Glove Delivery</h2>
            </div>
            <div className="prose max-w-none text-luxury-gray-500 uppercase tracking-widest text-xs leading-relaxed space-y-6">
              <p>
                Every AurumVault piece is a masterpiece, and we believe its journey to you should be as exceptional as the piece itself. We offer complimentary, fully insured white-glove delivery on all orders.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="p-8 border border-luxury-gray-100 bg-luxury-gray-50">
                  <h3 className="text-[10px] font-bold text-black mb-4">Domestic Delivery</h3>
                  <p>Hand-delivered within 2-3 business days across major cities.</p>
                </div>
                <div className="p-8 border border-luxury-gray-100 bg-luxury-gray-50">
                  <h3 className="text-[10px] font-bold text-black mb-4">International Shipping</h3>
                  <p>Express global delivery within 5-7 business days, fully customs-handled.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Insurance Section */}
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-luxury-gray-50 rounded-full">
                <ShieldCheck size={24} className="text-accent" />
              </div>
              <h2 className="text-xl font-serif uppercase tracking-widest">Full Insurance</h2>
            </div>
            <p className="text-luxury-gray-500 uppercase tracking-widest text-xs leading-relaxed">
              Your acquisition is fully protected from the moment it leaves our vault until it is placed in your hands. We partner with specialized high-value couriers to ensure absolute security and discretion.
            </p>
          </section>

          {/* Returns Section */}
          <section className="bg-luxury-cream p-12 border border-luxury-gold/20">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Clock size={24} className="text-accent" />
              </div>
              <h2 className="text-xl font-serif uppercase tracking-widest">The Aurum Guarantee</h2>
            </div>
            <div className="prose max-w-none text-luxury-gray-500 uppercase tracking-widest text-xs leading-relaxed space-y-6">
              <p>
                We allow a 14-day window for returns or exchanges. Pieces must be in their original, pristine condition and accompanied by all original certification and packaging.
              </p>
              <p className="flex items-start space-x-2 text-[10px] text-accent italic">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span>Bespoke or customized commissions are final sale and non-refundable due to their unique, personalized nature.</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
