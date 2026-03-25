import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  media: any[];
}

interface WishlistContextType {
  wishlistItems: Product[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearWishlistLocally: () => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/auth/wishlist');
      setWishlistItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist', 'error');
      // Redirection handled individually per component hook due to standard hook limitations in custom contexts
      return false;
    }
    
    try {
      const res = await api.put(`/auth/wishlist/${productId}`);
      const isAdded = res.data.message === 'Added to wishlist';
      showToast(res.data.message, 'success');
      
      // Resync logic entirely rather than manual injection since we want full Product objects via populate
      await fetchWishlist();
      return isAdded;
    } catch (err: any) {
      showToast('Failed to update wishlist', 'error');
      return false;
    }
  };

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some((item) => item._id === productId);
  }, [wishlistItems]);

  const clearWishlistLocally = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, clearWishlistLocally, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
