import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sprout, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Welcome back!', description: 'Login successful' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Login Failed',
        description: err.message || 'Invalid email or password. Please register first.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
          <h1 className="mt-4 text-center font-heading text-2xl font-bold">{t('auth.welcome')}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t('auth.login')}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : t('auth.login')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">{t('auth.signup')}</Link>
          </p>

          <div className="mt-4 rounded-lg bg-accent/50 p-3 text-xs text-muted-foreground">
            <p className="font-semibold">⚠️ First time?</p>
            <p>Please <Link to="/signup" className="text-primary font-medium underline">Sign Up</Link> first to create your account, then login.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
