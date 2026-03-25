import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-luxury-gray-200 h-20">
      <div className="container mx-auto px-6 h-full flex justify-between items-center relative">
        {/* Mobile menu button */}
        <button className="lg:hidden z-50" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-serif tracking-widest md:tracking-luxury uppercase absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 z-50">
          AurumVault
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-12">
          <NavLink to="/shop" className={({isActive}) => `nav-link ${isActive ? 'text-accent' : ''}`}>Collections</NavLink>
          <NavLink to="/shop?gender=Male" className="nav-link">Men</NavLink>
          <NavLink to="/shop?gender=Female" className="nav-link">Women</NavLink>
          <NavLink to="/quote" className={({isActive}) => `nav-link ${isActive ? 'text-accent' : ''}`}>Bespoke</NavLink>
          <NavLink to="/contact" className={({isActive}) => `nav-link ${isActive ? 'text-accent' : ''}`}>Concierge</NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 md:space-x-6 z-50">
          <Link to="/profile" className="hidden lg:block hover:text-accent transition-colors">
            <User size={20} />
          </Link>
          <Link to="/wishlist" className="hover:text-accent transition-colors relative">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center animate-fade-in font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="hover:text-accent transition-colors relative">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-[10px] text-white w-4 h-4 rounded-full flex items-center justify-center animate-fade-in font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

    </nav>
    
    {/* Mobile Menu - Final Premium Design */}
    {isOpen && (
      <div className="fixed inset-0 top-0 bg-white z-[9999] overflow-y-auto animate-fade-in flex flex-col">
        {/* Header replication inside menu */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-luxury-gray-100">
           <button onClick={() => setIsOpen(false)}><X size={24} /></button>
           <span className="text-2xl font-serif tracking-luxury uppercase">AurumVault</span>
           <div className="w-6"></div> {/* placeholder */}
        </div>
        
        <div className="flex flex-col space-y-8 px-10 py-12 flex-grow overflow-y-auto">
          {/* Main Portfolio */}
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-luxury-gray-400 font-bold mb-4">Maison Portfolio</p>
            <NavLink to="/shop" onClick={() => setIsOpen(false)} className="text-2xl font-serif uppercase tracking-[0.1em] text-black hover:text-accent transition-colors block border-b border-luxury-gray-50 pb-6">The Collections</NavLink>
            <div className="flex space-x-12 pl-4">
              <NavLink to="/shop?gender=Male" onClick={() => setIsOpen(false)} className="text-lg font-serif uppercase tracking-widest text-luxury-gray-500 hover:text-black">Men</NavLink>
              <NavLink to="/shop?gender=Female" onClick={() => setIsOpen(false)} className="text-lg font-serif uppercase tracking-widest text-luxury-gray-500 hover:text-black">Women</NavLink>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <NavLink to="/quote" onClick={() => setIsOpen(false)} className="text-2xl font-serif uppercase tracking-[0.1em] text-black hover:text-accent transition-colors block border-b border-luxury-gray-50 pb-6">Bespoke Jewelry</NavLink>
            <NavLink to="/contact" onClick={() => setIsOpen(false)} className="text-2xl font-serif uppercase tracking-[0.1em] text-black hover:text-accent transition-colors block border-b border-luxury-gray-50 pb-6">Concierge</NavLink>
          </div>

          {/* Account & Info */}
          <div className="space-y-4 pt-10 mt-auto">
            <NavLink to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-4 text-luxury-charcoal hover:text-accent transition-colors">
              <User size={18} />
              <span className="uppercase tracking-widest text-sm">My Private Vault</span>
            </NavLink>
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-luxury-gray-100">
              <NavLink to="/shipping" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black">Shipping & Returns</NavLink>
              <NavLink to="/privacy" onClick={() => setIsOpen(false)} className="text-[10px] uppercase tracking-widest text-luxury-gray-400 hover:text-black">Privacy Policy</NavLink>
            </div>
          </div>
          
          <div className="pt-10 pb-6 text-center">
             <p className="text-[9px] uppercase tracking-[0.4em] text-luxury-gray-300">AurumVault Private Atelier • {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Navbar;
