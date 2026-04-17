import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, CheckCircle2, Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CartPage = () => {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // For a real cart, we'd loop through items and create individual orders
      // Based on our simpler backend route, you create an order for each product.
      const orderPromises = cart.map((item) => 
        fetch('http://localhost:5000/api/orders/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({
            productId: item.product._id,
            quantity: item.quantity
          })
        })
      );

      const responses = await Promise.all(orderPromises);
      const allSuccessful = responses.every(r => r.ok);

      if (allSuccessful) {
        setSuccess(true);
        clearCart();
        toast({ title: 'Order placed successfully!' });
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        throw new Error("One or more orders failed to process.");
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Checkout failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-card p-8 rounded-2xl border border-green-200 card-shadow text-center max-w-md w-full animate-scale-in">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold font-heading mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground mb-6">Your order has been sent to the farmer(s). You can track its progress in your dashboard.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold flex items-center gap-3 mb-8">
          <ShoppingCart className="text-primary h-8 w-8" /> 
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any fresh produce yet.</p>
            <Button onClick={() => navigate('/marketplace')}>Browse Marketplace</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.product._id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card border border-border rounded-xl">
                  <img 
                    src={item.product.image?.startsWith('/uploads') ? `http://localhost:5000${item.product.image}` : item.product.image || 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop'} 
                    alt={item.product.cropName}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg">{item.product.cropName}</h3>
                    <p className="text-sm text-muted-foreground">Farmer: {item.product.farmer?.name}</p>
                    <p className="text-primary font-bold mt-1">₹{item.product.price} / kg</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-accent">
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right w-20 font-bold">
                      ₹{item.product.price * item.quantity}
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h3 className="font-heading font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>₹{getTotal()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{getTotal()}</span>
                  </div>
                </div>
                <Button 
                  className="w-full gap-2 text-lg h-12" 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? 'Processing...' : 'Place Order'} 
                  {!isCheckingOut && <ArrowRight className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
