import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingBag, Search, MapPin, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config';

const Marketplace = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    if (!user) {
      toast({ title: 'Please login to add to cart', variant: 'destructive' });
      return;
    }
    if (user.role === 'farmer') {
      toast({ title: 'Cart functionality is for buyers', variant: 'destructive' });
      return;
    }
    
    addToCart(product, 1);
    toast({ title: `${product.cropName} added to cart!` });
  };

  const filteredProducts = products.filter(p => 
    p.cropName?.toLowerCase().includes(search.toLowerCase()) || 
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="text-primary h-8 w-8" /> 
              Farm Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">Buy fresh produce directly from farmers!</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search crops or locations..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="card-shadow-hover rounded-xl border border-border bg-card overflow-hidden flex flex-col animate-fade-in group transition-all">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={product.image?.startsWith('/uploads') ? `${API_URL}${product.image}` : product.image || 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop'} 
                    alt={product.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {product.quantity}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-heading font-bold text-lg">{product.cropName}</h3>
                    <p className="text-primary font-bold text-xl">₹{product.price} <span className="text-sm font-normal text-muted-foreground">/ kg</span></p>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/50 p-2 rounded-lg">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                    <div className="text-xs text-muted-foreground px-1 pb-1">
                      Farmer: <span className="font-medium text-foreground">{product.farmer?.name || 'Local Farmer'}</span>
                    </div>
                    <Button onClick={() => handleAddToCart(product)} className="w-full gap-2 mt-2">
                      <Plus className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export default Marketplace;
