import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, toggleWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="pt-40 min-h-screen container mx-auto px-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-40 pb-24 min-h-screen container mx-auto px-6 text-center flex flex-col items-center justify-center">
        <Heart className="w-16 h-16 text-luxury-gray-200 mb-6" />
        <h1 className="text-3xl font-serif uppercase tracking-widest mb-4">Your Wishlist is Empty</h1>
        <p className="text-luxury-gray-500 mb-8 max-w-md mx-auto">Discover the perfect piece in our collections to add to your private vault.</p>
        <Link to="/shop" className="btn-primary">Explore Collections</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-serif uppercase tracking-widest mb-2 border-b border-luxury-gray-100 pb-6">Private Wishlist</h1>
        <p className="text-xs uppercase tracking-luxury text-luxury-gray-400 mb-12">Curated selection of your favorite pieces</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => (
            <div key={product._id} className="group flex flex-col">
              <Link to={`/product/${product._id}`} className="block aspect-[3/4] bg-luxury-gray-50 overflow-hidden mb-4 relative">
                <img 
                  src={product.media?.[0]?.url || 'https://via.placeholder.com/800x1200?text=AurumVault'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
              
              <div className="mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent block mb-1">{product.category}</span>
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-serif uppercase lg:text-sm group-hover:text-accent transition-colors leading-snug truncate">{product.name}</h3>
                </Link>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-luxury-gray-100">
                <span className="text-sm tracking-widest font-medium">KES {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}</span>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => toggleWishlist(product._id)}
                    className="p-2 text-luxury-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                        addToCart(product);
                        toggleWishlist(product._id);
                    }}
                    className="p-2 text-luxury-gray-400 hover:text-accent transition-colors"
                    title="Move to Cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
