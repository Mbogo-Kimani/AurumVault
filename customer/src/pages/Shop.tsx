import { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useApi';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const category = searchParams.get('category');
  const gender = searchParams.get('gender');
  const quality = searchParams.get('quality');
  const sort = searchParams.get('sort') || 'newest';

  const { data: products, isLoading } = useProducts({
    category,
    gender,
    quality
  });

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    let items = [...products];
    if (sort === 'price-low') items.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    if (sort === 'price-high') items.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    if (sort === 'newest') items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  }, [products, sort]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-wider mb-4">
            {category || 'The Collection'}
          </h1>
          <p className="text-luxury-gray-500 uppercase tracking-luxury text-sm">
            Discover our curated selection of fine jewelry
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:row justify-between items-center mb-12 border-y border-luxury-gray-100 py-4 gap-4">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 text-xs uppercase tracking-luxury font-bold hover:text-accent transition-colors"
          >
            <SlidersHorizontal size={16} />
            <span>Filter {category || gender || quality ? '(1)' : ''}</span>
          </button>

          <div className="flex items-center space-x-8">
            <span className="text-[10px] text-luxury-gray-400 uppercase tracking-widest">{sortedProducts.length} Results</span>
            <div className="relative group">
              <button className="flex items-center space-x-2 text-xs uppercase tracking-luxury font-bold">
                <span>Sort: {sort.replace('-', ' ')}</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-luxury-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {['newest', 'price-low', 'price-high'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => updateFilter('sort', s)}
                    className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-luxury hover:bg-luxury-gray-50"
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 p-8 bg-luxury-gray-50 animate-fade-in">
            <div>
              <h4 className="text-[10px] uppercase tracking-luxury font-bold mb-4">Category</h4>
              <div className="flex flex-col space-y-2">
                {[null, 'Ring', 'Necklace', 'Bracelet', 'Earring', 'Watch', 'Pendant'].map((cat) => (
                  <button 
                    key={cat || 'all'} 
                    onClick={() => updateFilter('category', cat)}
                    className={`text-xs text-left hover:text-accent transition-colors ${category === cat ? 'text-accent font-bold' : 'text-luxury-gray-600'}`}
                  >
                    {cat || 'All Categories'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-luxury font-bold mb-4">Gender</h4>
              <div className="flex flex-col space-y-2">
                 {[null, 'Male', 'Female', 'Unisex'].map((g) => (
                  <button 
                    key={g || 'all'} 
                    onClick={() => updateFilter('gender', g)}
                    className={`text-xs text-left hover:text-accent transition-colors ${gender === g ? 'text-accent font-bold' : 'text-luxury-gray-600'}`}
                  >
                    {g || 'All Genders'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-luxury font-bold mb-4">Quality</h4>
              <div className="flex flex-col space-y-2">
                {[null, 'Standard', 'Premium', 'Luxury'].map((q) => (
                  <button 
                    key={q || 'all'} 
                    onClick={() => updateFilter('quality', q)}
                    className={`text-xs text-left hover:text-accent transition-colors ${quality === q ? 'text-accent font-bold' : 'text-luxury-gray-600'}`}
                  >
                    {q || 'All Qualities'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSearchParams({});
                  setIsFilterOpen(false);
                }}
                className="text-[10px] uppercase tracking-widest underline hover:text-accent"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] bg-luxury-gray-100 mb-6"></div>
                <div className="h-4 bg-luxury-gray-100 w-3/4"></div>
                <div className="h-4 bg-luxury-gray-100 w-1/4"></div>
              </div>
            ))
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product: any) => (
              <Link key={product._id} to={`/product/${product._id}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-luxury-gray-50 mb-6 relative">
                  <img 
                    src={product.media?.[0]?.url || 'https://via.placeholder.com/600x800?text=AurumVault'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {product.isNewArrival && (
                    <span className="absolute top-4 left-4 bg-black text-white text-[8px] uppercase tracking-luxury px-2 py-1">New Arrival</span>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="product-title group-hover:text-accent transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-luxury-gray-400 uppercase tracking-widest mb-2">{product.category} • {product.quality}</p>
                    <div className="flex items-center space-x-3">
                      <span className="product-price">KES {product.salePrice?.toLocaleString() || product.price?.toLocaleString()}</span>
                      {product.onDiscount && (
                        <span className="text-[10px] text-luxury-gray-400 line-through">KES {product.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <p className="text-luxury-gray-400 uppercase tracking-luxury">No pieces found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
