import React, { useState, useEffect } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Star,
  Percent,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MediaItem {
  url: string;
  public_id: string;
  type: 'image' | 'video';
  _id: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  isNewArrival: boolean;
  onDiscount: boolean;
  discountPercentage: number;
  availability: boolean;
  description?: string;
  media: MediaItem[];
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedGender, priceRange]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api('/products');
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = (product.name || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesCategory = selectedCategory === 'all' || (product.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const matchesGender = selectedGender === 'all' || (product.gender || '').toLowerCase() === selectedGender.toLowerCase();
      const matchesPrice = (product.price || 0) >= priceRange.min && (product.price || 0) <= priceRange.max;

      return matchesSearch && matchesCategory && matchesGender && matchesPrice;
    });

    setFilteredProducts(filtered);
  };

  const toggleNewArrival = async (productId: string, currentStatus: boolean) => {
    try {
      await api(`/products/${productId}`, {
        method: 'PUT',
        body: { isNewArrival: !currentStatus }
      });

      fetchProducts();
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api(`/products/${productId}`, {
        method: 'DELETE'
      });
      fetchProducts();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const endpoint = editingProduct ? `/products/${editingProduct._id}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      await api(endpoint, {
        method: method,
        body: formData
      });

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
      });
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Inventory Management</h1>
          <p className="text-gray-500 font-medium">Manage your product catalog and availability</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if(!open) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold h-11 px-6 shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform">
              <Plus className="w-5 h-5 mr-2" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingProduct ? 'Update Product Details' : 'Onboard New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Product Name</Label>
                  <Input name="name" defaultValue={editingProduct?.name} placeholder="e.g. 24K Gold Bar" required className="font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Price (KES)</Label>
                  <Input name="price" type="number" defaultValue={editingProduct?.price} placeholder="Enter value" required className="font-bold text-green-600" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Category</Label>
                  <select name="category" defaultValue={editingProduct?.category || 'Ring'} required className="w-full h-10 px-3 border border-gray-200 rounded-md font-medium focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="Ring">Ring</option>
                    <option value="Necklace">Necklace</option>
                    <option value="Bracelet">Bracelet</option>
                    <option value="Earring">Earring</option>
                    <option value="Pendant">Pendant</option>
                    <option value="Watch">Watch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Gender / Target</Label>
                  <select name="gender" defaultValue={editingProduct?.gender || 'Unisex'} className="w-full h-10 px-3 border border-gray-200 rounded-md font-medium focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Quality</Label>
                  <select name="quality" defaultValue={(editingProduct as any)?.quality || 'Standard'} className="w-full h-10 px-3 border border-gray-200 rounded-md font-medium focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Discount Percentage (%)</Label>
                  <Input name="discountPercentage" type="number" defaultValue={editingProduct?.discountPercentage || 0} placeholder="0" className="font-medium" />
                </div>
                <div className="flex items-center pt-8 space-x-3">
                   <input 
                     type="checkbox" 
                     name="isNewArrival" 
                     defaultChecked={editingProduct?.isNewArrival} 
                     id="isNewArrival" 
                     value="true"
                     className="w-5 h-5 accent-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                   />
                   <Label htmlFor="isNewArrival" className="font-bold text-gray-700 cursor-pointer">Mark as New Arrival</Label>
                </div>
                <div className="flex items-center pt-8 space-x-3">
                   <input 
                     type="checkbox" 
                     name="onDiscount" 
                     defaultChecked={editingProduct?.onDiscount} 
                     id="onDiscount" 
                     value="true"
                     className="w-5 h-5 accent-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                   />
                   <Label htmlFor="onDiscount" className="font-bold text-gray-700 cursor-pointer">On Discount</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Product Description</Label>
                <textarea 
                  name="description" 
                  defaultValue={editingProduct?.description} 
                  className="w-full p-3 border border-gray-200 rounded-md h-32 font-medium focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                  placeholder="Describe your product highlight features..."
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 space-y-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Media Assets</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700 flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-yellow-600" />
                      Product Images (Max 5)
                    </Label>
                    <Input name="images" type="file" multiple accept="image/*" className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700 flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-blue-600" />
                      Product Video (Optional)
                    </Label>
                    <Input name="video" type="file" accept="video/*" className="bg-white" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-12 font-bold border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2] h-12 bg-yellow-600 hover:bg-yellow-700 text-black font-bold shadow-lg shadow-yellow-500/10" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing Request...' : (editingProduct ? 'Save Changes' : 'Publish Product')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search by product name..." 
            className="pl-10 border-gray-200 focus:border-yellow-500 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-200 rounded-md px-4 py-2 bg-white h-10 font-medium text-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select 
          className="border border-gray-200 rounded-md px-4 py-2 bg-white h-10 font-medium text-gray-600 focus:ring-2 focus:ring-yellow-500 outline-none"
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
        >
          <option value="all">Every Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl relative">
            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
               {product.media.length > 0 ? (
                  <img
                    src={product.media[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
               )}
               
               {/* Badges Overlay */}
               <div className="absolute top-3 left-3 flex flex-col gap-2">
                 {product.isNewArrival && (
                    <Badge className="bg-yellow-500 text-black border-none font-bold uppercase text-[10px] tracking-widest px-2 py-1 shadow-md">
                      New Arrival
                    </Badge>
                 )}
                 {product.onDiscount && product.discountPercentage > 0 && (
                    <Badge className="bg-red-500 text-white border-none font-bold uppercase text-[10px] tracking-widest px-2 py-1 shadow-md">
                      {product.discountPercentage}% OFF
                    </Badge>
                 )}
               </div>

               {/* Availability Overlay */}
               {!product.availability && (
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <Badge variant="secondary" className="bg-white/90 text-black font-bold opacity-100 border-none px-4 py-2 text-sm uppercase tracking-widest">
                      Out of Stock
                    </Badge>
                 </div>
               )}
            </div>

            <CardHeader className="p-5 pb-2">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{product.category}</span>
                <span className="text-xs font-bold text-yellow-600 uppercase tracking-tighter">{product.gender}</span>
              </div>
              <CardTitle className="text-lg font-bold line-clamp-2 leading-tight min-h-[3rem] group-hover:text-yellow-600 transition-colors">
                {product.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-5 pt-0">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    KES {product.price.toLocaleString()}
                  </span>
                  {product.onDiscount && product.discountPercentage > 0 && (
                     <span className="text-sm text-gray-400 line-through">
                       KES {(product.price * (1 + product.discountPercentage/100)).toFixed(0)}
                     </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => { setEditingProduct(product); setShowForm(true); }}
                  className="flex-1 bg-gray-100 hover:bg-yellow-50 text-gray-600 hover:text-yellow-700 border-none font-bold shadow-none text-xs transition-all"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Details
                </Button>
                <Button
                  onClick={() => deleteProduct(product._id)}
                  className="flex-shrink-0 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border-none shadow-none text-xs w-11 p-0 transition-all rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 py-20 text-center">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No Products Found</h3>
          <p className="text-gray-400 mt-1">Try refining your search or category selection</p>
        </div>
      )}
    </div>
  );
};

export default Products;
