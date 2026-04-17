import { Phone, MessageCircle, ShoppingCart, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onPlaceOrder?: (product: Product) => void;
}

const ProductCard = ({ product, onPlaceOrder }: ProductCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCall = () => {
    window.open(`tel:${product.farmerPhone}`);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi, I'm interested in your ${product.name} listed on UzhavarLink.`);
    window.open(`https://wa.me/${product.farmerPhone.replace('+', '')}?text=${msg}`);
  };

  const handleOrder = () => {
    if (!user) {
      toast({ title: 'Please login first', variant: 'destructive' });
      return;
    }
    onPlaceOrder?.(product);
  };

  return (
    <div className="group card-shadow animate-fade-in overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute right-2 top-2">
          <Badge variant={product.inStock ? 'default' : 'destructive'} className="text-xs">
            {product.inStock ? t('product.inStock') : t('product.outOfStock')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">{product.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {product.location}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-heading text-2xl font-bold text-primary">₹{product.price}</span>
          <span className="text-sm text-muted-foreground">{t('product.perKg')}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.quantity} • {product.farmerName}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={handleCall}>
            <Phone className="h-3.5 w-3.5" />
            {t('product.call')}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1.5 border-success/30 text-success hover:bg-success/10" onClick={handleWhatsApp}>
            <MessageCircle className="h-3.5 w-3.5" />
            {t('product.whatsapp')}
          </Button>
        </div>
        {user?.role === 'buyer' && product.inStock && (
          <Button size="sm" className="mt-2 w-full gap-1.5" onClick={handleOrder}>
            <ShoppingCart className="h-3.5 w-3.5" />
            {t('product.placeOrder')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
