import { Lock, Eye, FileText, UserCheck } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-serif uppercase tracking-widest mb-12 border-b border-luxury-gray-100 pb-8 text-center">Privacy Policy</h1>
        
        <div className="space-y-12">
          <section>
            <div className="flex items-center space-x-4 mb-6 text-accent">
              <Lock size={20} />
              <h2 className="text-xs uppercase tracking-luxury font-bold">Data Sovereignty</h2>
            </div>
            <p className="text-luxury-gray-500 uppercase tracking-widest text-[10px] leading-loose">
              At AurumVault, discretion is the cornerstone of our relationship. We are committed to protecting your personal information and ensuring your data remains your own. This policy outlines how we handle the information you entrust to us.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section className="p-8 border border-luxury-gray-50">
               <Eye size={24} className="text-accent mb-6" />
               <h3 className="text-xs uppercase tracking-luxury font-bold mb-4">Information Gathering</h3>
               <p className="text-luxury-gray-400 uppercase tracking-widest text-[9px] leading-relaxed">
                 We collect essential information to provide our bespoke services, including name, contact details, and acquisition preferences. We never sell or share your data with third-party advertisers.
               </p>
            </section>

             <section className="p-8 border border-luxury-gray-50">
               <UserCheck size={24} className="text-accent mb-6" />
               <h3 className="text-xs uppercase tracking-luxury font-bold mb-4">Secure Transactions</h3>
               <p className="text-luxury-gray-400 uppercase tracking-widest text-[9px] leading-relaxed">
                 All financial data is processed through encrypted, industry-standard gateways. AurumVault does not store your full card information or M-Pesa PINs on our servers.
               </p>
            </section>
          </div>

          <section className="bg-luxury-gray-50 p-10">
            <div className="flex items-center space-x-4 mb-6">
              <FileText size={20} className="text-luxury-charcoal" />
              <h2 className="text-xs uppercase tracking-luxury font-bold">Your Rights</h2>
            </div>
            <p className="text-luxury-gray-400 uppercase tracking-widest text-[9px] leading-loose mb-8">
              Under international data protection laws, you have the right to access, correct, or request the deletion of your personal information at any time. You may withdraw your consent for marketing communications via our concierge.
            </p>
            <div className="pt-6 border-t border-luxury-gray-200">
               <p className="text-[8px] uppercase tracking-widest text-luxury-gray-400 italic">Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
