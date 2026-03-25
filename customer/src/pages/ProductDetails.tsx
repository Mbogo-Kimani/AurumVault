import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useApi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, MessageSquare, Check, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id!);
  const { data: relatedProducts } = useProducts({ category: product?.category });
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const isWishlisted = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist', 'error');
      navigate('/login');
      return;
    }
    if (product) {
       await toggleWishlist(product._id);
    }
  };

  if (isLoading) return <div className="pt-32 min-h-screen container mx-auto px-6 h-[70vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
  </div>;

  if (!product) return <div className="pt-32 min-h-screen container mx-auto px-6 text-center">
    <h1 className="text-2xl font-serif uppercase">Product not found</h1>
    <Link to="/shop" className="btn-outline mt-8 inline-block">Return to Boutique</Link>
  </div>;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-xs uppercase tracking-widest text-luxury-gray-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to previous
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Media Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-luxury-gray-50 overflow-hidden relative">
              <img 
                src={product.media?.[activeMediaIndex]?.url || 'https://via.placeholder.com/1000x1000?text=AurumVault'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.media?.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button 
                    onClick={() => setActiveMediaIndex((prev) => (prev === 0 ? product.media.length - 1 : prev - 1))}
                    className="p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                     onClick={() => setActiveMediaIndex((prev) => (prev === product.media.length - 1 ? 0 : prev + 1))}
                    className="p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.media?.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {product.media.map((m: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 border-2 transition-all ${activeMediaIndex === idx ? 'border-accent' : 'border-transparent'}`}
                  >
                    <img src={m.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="border-b border-luxury-gray-100 pb-8 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold">{product.quality} Collection</span>
                {product.isNewArrival && <span className="text-[10px] uppercase tracking-[0.2em] bg-black text-white px-2 py-0.5">Limited Edition</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif uppercase mb-6 leading-tight">{product.name}</h1>
              <div className="flex items-baseline space-x-4 mb-6">
                <span className="text-2xl tracking-widest text-luxury-charcoal">KES {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}</span>
                {product.onDiscount && (
                  <span className="text-lg text-luxury-gray-400 line-through tracking-widest">KES {product.price.toLocaleString()}</span>
                )}
              </div>
              <p className="text-luxury-gray-600 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 mb-12">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  className={`btn-primary flex items-center justify-center space-x-3 transition-all ${added ? 'bg-green-600' : ''}`}
                >
                  {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                  <span>{added ? 'Added to Bag' : 'Reserve Piece'}</span>
                </button>
                <button 
                  onClick={handleWishlistToggle}
                  className={`btn-outline flex items-center justify-center space-x-3 transition-colors ${isWishlisted ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}`}
                >
                  <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>
              <Link to={`/quote?product=${product.name}`} className="w-full border border-accent text-accent py-4 uppercase text-xs tracking-luxury flex items-center justify-center space-x-3 hover:bg-accent hover:text-white transition-all">
                <MessageSquare size={18} />
                <span>Request Custom Quote</span>
              </Link>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-luxury-gray-100">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Authenticity Guaranteed</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck size={20} className="text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Insured White-glove Shipping</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw size={20} className="text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold">30-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.length > 1 && (
          <section>
            <h2 className="text-2xl font-serif uppercase mb-12 border-b border-luxury-gray-100 pb-4">You May Also Appreciate</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {relatedProducts.filter((p: any) => p._id !== id).slice(0, 4).map((p: any) => (
                <Link key={p._id} to={`/product/${p._id}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-luxury-gray-50 mb-4">
                    <img src={p.media?.[0]?.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-serif uppercase text-sm group-hover:text-accent transition-colors">{p.name}</h3>
                  <span className="text-xs tracking-luxury text-luxury-gray-500">KES {p.salePrice?.toLocaleString() || p.price?.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
