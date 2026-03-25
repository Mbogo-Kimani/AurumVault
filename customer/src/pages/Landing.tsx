import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useApi';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const { data: featuredProducts, isLoading } = useProducts({ limit: 4 });

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Jewelry"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-white text-5xl md:text-8xl font-serif mb-8 tracking-wider uppercase animate-fade-in">
            Timeless Elegance
          </h1>
          <p className="text-luxury-gray-200 text-lg md:text-xl uppercase tracking-luxury mb-12 max-w-2xl mx-auto">
            Discover the artistry of fine craftsmanship and the heritage of AurumVault.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
            <Link to="/shop" className="btn-primary border border-white hover:bg-white hover:text-black">
              Explore Collection
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-black">
              Private Salon
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16 px-6">
            <div>
              <span className="text-accent uppercase tracking-luxury text-sm font-bold block mb-4">Curated selection</span>
              <h2 className="text-4xl md:text-5xl font-serif uppercase">Signature Pieces</h2>
            </div>
            <Link to="/shop" className="group flex items-center space-x-2 text-sm uppercase tracking-luxury hover:text-accent transition-all pb-1 border-b border-transparent hover:border-accent">
              <span>View All</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 px-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-[3/4] bg-luxury-gray-100 mb-6"></div>
                  <div className="h-4 bg-luxury-gray-100 w-3/4"></div>
                  <div className="h-4 bg-luxury-gray-100 w-1/4"></div>
                </div>
              ))
            ) : (
              featuredProducts?.slice(0, 4).map((product: any) => (
                <Link key={product._id} to={`/product/${product._id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-luxury-gray-50 mb-6 group-hover:shadow-2xl transition-shadow duration-500">
                    <img 
                      src={product.media?.[0]?.url || 'https://via.placeholder.com/600x800?text=AurumVault'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="product-title group-hover:text-accent transition-colors">{product.name}</h3>
                  <div className="flex items-center space-x-4">
                    <span className="product-price">KES {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}</span>
                    {product.onDiscount && (
                      <span className="text-[10px] text-accent uppercase tracking-luxury font-bold">In Offer</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-luxury-cream overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
             <img 
              src="/images/craftsmanship.png" 
              alt="Craftsmanship"
              className="w-full aspect-square object-cover shadow-2xl"
            />
            <div className="absolute -bottom-12 -right-12 bg-black text-white p-12 hidden lg:block max-w-xs">
              <h3 className="text-xl font-serif mb-4 italic">"True luxury is not just what you see, but the depth of artistry within."</h3>
              <p className="text-xs uppercase tracking-widest text-luxury-gray-400">— Master Goldsmith</p>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-accent uppercase tracking-luxury text-sm font-bold">The Heritage</span>
            <h2 className="text-4xl md:text-6xl font-serif uppercase leading-tight">Masters of the Precious</h2>
            <p className="text-luxury-gray-600 leading-relaxed text-lg">
              For over three decades, AurumVault has stood as a bastion of luxury, crafting pieces that are not merely jewelry, but legacies. Every diamond is ethically sourced, every gold band meticulously forged by hand in our private atelier.
            </p>
            <p className="text-luxury-gray-600 leading-relaxed text-lg">
              Our vault is more than a storage—it is a sanctuary for rarity. We invite you to experience the singular beauty of AurumVault.
            </p>
            <Link to="/quote" className="inline-block btn-outline mt-8">
              Discover Our Craft
            </Link>
          </div>
        </div>
      </section>

       {/* Banner Section */}
       <section className="relative h-[60vh] flex items-center justify-center bg-black">
        <div className="absolute inset-0 opacity-40">
           <img 
              src="/images/diamond.png" 
              alt="Diamond Detail"
              className="w-full h-full object-cover"
            />
        </div>
        <div className="relative z-10 text-center px-6">
          <h2 className="text-white text-3xl md:text-5xl font-serif mb-12 tracking-luxury uppercase">
            Experience the Singular
          </h2>
          <Link to="/shop?quality=Luxury" className="btn-gold">
            View luxury collection
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
