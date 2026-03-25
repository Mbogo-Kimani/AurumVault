import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Landing from './pages/Landing';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Quote from './pages/Quote';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Shipping from './pages/Shipping';
import Privacy from './pages/Privacy';
import ForgotPassword from './pages/ForgotPassword';
import Wishlist from './pages/Wishlist';
import VerifyEmail from './pages/VerifyEmail';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './contexts/ToastContext';

const NotFound = () => <div className="pt-24 min-h-screen container mx-auto px-6 text-center h-[50vh] flex flex-col justify-center">
  <h1 className="text-4xl uppercase tracking-widest mb-4">404</h1>
  <p className="text-luxury-gray-500 py-8">THE PAGE YOU DISCOVERED HAS TRANSCENDED INTO THE VAULT.</p>
</div>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
              <div className="flex flex-col min-h-screen font-sans text-luxury-charcoal bg-white selection:bg-luxury-gold selection:text-white">
                <Navbar />
                <main className="flex-grow pt-20">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/cart" element={<Checkout />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
