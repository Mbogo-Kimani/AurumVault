import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useApi';
import { Truck, MapPin, CheckCircle, Clock, LogOut, RefreshCw, ArrowRight, ShoppingBag, Package, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<'history' | 'deliveries' | 'pickups'>('history');
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.patch(`/payments/${id}/delivery-status`, { status });
      return data;
    },
    onSuccess: () => {
      showToast('Status updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      showToast('Failed to update status', 'error');
    }
  });

  if (!user) {
    return (
      <div className="pt-40 pb-24 min-h-screen container mx-auto px-6 text-center">
        <h2 className="text-2xl font-serif uppercase mb-8">Access Denied</h2>
        <p className="text-luxury-gray-500 uppercase tracking-luxury text-xs mb-12">Please sign in to view your collection and orders.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  const filteredOrders = orders?.filter((order: any) => {
    if (activeTab === 'history') return true;
    if (activeTab === 'deliveries') return order.fulfillmentType === 'delivery';
    if (activeTab === 'pickups') return order.fulfillmentType === 'pickup';
    return true;
  });

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-luxury-gray-100 pb-8">
          <div>
            <span className="text-accent uppercase tracking-luxury text-[10px] font-bold block mb-2">Member Profile</span>
            <h1 className="text-4xl font-serif uppercase tracking-widest">{user.name}</h1>
            <p className="text-luxury-gray-500 text-xs uppercase tracking-luxury mt-2">{user.email}</p>
          </div>
          <button 
            onClick={logout}
            className="btn-outline border-luxury-gray-200 text-luxury-gray-400 hover:text-red-500 hover:border-red-200 text-[10px] flex items-center space-x-2 px-6"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-8 mb-12 border-b border-luxury-gray-50">
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === 'history' ? 'text-black' : 'text-luxury-gray-400'}`}
              >
                Purchase History
                {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-scale-x" />}
              </button>
              <button 
                onClick={() => setActiveTab('deliveries')}
                className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === 'deliveries' ? 'text-black' : 'text-luxury-gray-400'}`}
              >
                Vault Deliveries
                {activeTab === 'deliveries' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-scale-x" />}
              </button>
              <button 
                onClick={() => setActiveTab('pickups')}
                className={`pb-4 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === 'pickups' ? 'text-black' : 'text-luxury-gray-400'}`}
              >
                Personal Collections
                {activeTab === 'pickups' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-scale-x" />}
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-luxury-gray-50 animate-pulse"></div>)}
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="space-y-8">
                {filteredOrders.map((order: any) => (
                  <div key={order._id} className="border border-luxury-gray-100 p-8 hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
                      <div className="flex items-center space-x-6">
                        <div className="p-4 bg-luxury-cream rounded-full">
                          {order.fulfillmentType === 'delivery' ? <Truck size={24} className="text-accent" /> : <MapPin size={24} className="text-accent" />}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400 mb-1">Portfolio Reference</p>
                          <p className="text-xs font-mono uppercase tracking-widest">{order.transactionId || order._id.slice(-12)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400 mb-1">Date</p>
                          <p className="text-[10px] uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400 mb-1">Payment</p>
                          <div className="flex items-center space-x-2">
                            {order.status === 'Success' ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} className="text-amber-500" />}
                            <span className={`text-[10px] uppercase font-bold ${order.status === 'Success' ? 'text-green-600' : 'text-amber-600'}`}>
                              {order.status === 'Success' ? 'Confirmed' : 'Processing'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400 mb-1">Status</p>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-accent italic">{order.deliveryStatus || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-luxury-gray-50 p-6 mb-8 border border-luxury-gray-100">
                       <div className="flex justify-between items-start">
                         <div className="space-y-2">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400">Items Acquisition</p>
                           {order.items?.map((item: any, idx: number) => (
                             <p key={idx} className="text-xs uppercase tracking-luxury">{item.productName} (x{item.quantity})</p>
                           )) || <p className="text-xs uppercase tracking-luxury">{order.productName}</p>}
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gray-400 mb-1">Total Valuation</p>
                           <p className="text-xl font-serif">KES {order.amount.toLocaleString()}</p>
                         </div>
                       </div>
                    </div>

                    {order.fulfillmentType === 'delivery' && order.deliveryDetails && (
                      <div className="text-[10px] uppercase tracking-luxury text-luxury-gray-500 border-l-2 border-accent pl-4 py-2 mb-8 bg-luxury-cream/30">
                        <p className="font-bold mb-1">Destination:</p>
                        <p>{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
                        {order.deliveryDetails.note && <p className="italic mt-1">Note: {order.deliveryDetails.note}</p>}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-6 border-t border-luxury-gray-50">
                      {order.deliveryStatus === 'Delivered' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Received' })}
                          className="btn-gold px-8 py-3 text-[10px]"
                        >
                          Confirm Acquisition
                        </button>
                      )}
                      {order.deliveryStatus === 'Received' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: order._id, status: 'Returned' })}
                          className="btn-outline px-8 py-3 text-[10px] border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Request Return
                        </button>
                      )}
                      <button className="text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black transition-colors ml-auto flex items-center space-x-2">
                         <RefreshCw size={12} />
                         <span>Support Concierge</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 bg-luxury-gray-50 text-center border border-dashed border-luxury-gray-200">
                <p className="text-luxury-gray-400 text-[10px] uppercase tracking-widest">No entries found for this category.</p>
                <Link to="/shop" className="text-accent text-[10px] uppercase tracking-widest font-bold mt-6 inline-block border-b border-accent">Explore the collection</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-luxury-cream p-10 border border-luxury-gray-100 shadow-sm">
               <h3 className="text-xs uppercase tracking-luxury font-bold mb-8 italic">VAULT MEMBERSHIP</h3>
               <div className="space-y-6">
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                   <span className="text-luxury-gray-500">Tier</span>
                   <span className="text-accent font-bold">PRESTIGE CLASS</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                   <span className="text-luxury-gray-500">Member Since</span>
                   <span>{new Date().getFullYear()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                   <span className="text-luxury-gray-500">Points Balance</span>
                   <span className="text-accent">2,450 VP</span>
                 </div>
               </div>
            </div>

            <div className="p-10 border border-luxury-gray-100">
               <h3 className="text-xs uppercase tracking-luxury font-bold mb-6">Concierge Support</h3>
               <p className="text-[10px] text-luxury-gray-500 leading-relaxed uppercase tracking-widest mb-8">
                 Your personal advisor is available for any questions regarding your acquisitions or private recommendations.
               </p>
               <Link to="/contact" className="btn-outline w-full text-center py-4 flex items-center justify-center space-x-3 text-[10px]">
                  <span>Contact Advisor</span>
                  <ArrowRight size={14} />
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
