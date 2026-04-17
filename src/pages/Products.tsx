import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockProducts, Product } from '@/data/mockData';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', 'vegetables', 'fruits', 'grains', 'dairy'] as const;
  const catKeys: Record<string, string> = {
    all: 'product.all',
    vegetables: 'product.vegetables',
    fruits: 'product.fruits',
    grains: 'product.grains',
    dairy: 'product.dairy',
  };

  const filtered = mockProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  const handlePlaceOrder = (product: Product) => {
    toast({
      title: `Order placed for ${product.name}!`,
      description: `₹${product.price} - Your order is now pending.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold">{t('nav.products')}</h1>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('product.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {t(catKeys[cat])}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onPlaceOrder={handlePlaceOrder} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">No products found</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;
