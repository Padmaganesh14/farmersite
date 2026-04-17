import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sprout, Tractor, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name, email, password, phone, role);
      toast({ title: 'Account Created', description: `Welcome, ${name}!` });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ 
        title: 'Signup Failed', 
        description: err.message || 'Could not create account', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="animate-scale-in w-full max-w-md card-shadow rounded-2xl border border-border bg-card p-8">
          <div className="flex justify-center">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-4 text-center font-heading text-2xl font-bold">{t('auth.createAccount')}</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            {/* Role selector */}
            <div>
              <Label>{t('auth.role')}</Label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'farmer' ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Tractor className={`h-8 w-8 ${role === 'farmer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'farmer' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t('auth.farmer')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    role === 'buyer' ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <ShoppingBag className={`h-8 w-8 ${role === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${role === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {t('auth.buyer')}
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">{t('auth.signup')}</Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
