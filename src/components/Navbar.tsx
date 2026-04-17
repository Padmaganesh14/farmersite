import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Language, languageNames } from '@/i18n/translations';
import { Menu, X, Globe, Sprout, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">UzhavarLink</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            {t('nav.home')}
          </Link>
          <Link to="/marketplace" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            {t('nav.products')}
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              {t('nav.dashboard')}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          {user?.role === 'buyer' && (
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative gap-1.5 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-scale-in">
                    {cart.length}
                  </span>
                )}
                Cart
              </Button>
            </Link>
          )}
          
          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {languageNames[language]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={language === lang ? 'bg-accent font-semibold' : ''}
                >
                  {languageNames[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  {user?.name}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">{t('nav.signup')}</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-slide-up border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              {t('nav.home')}
            </Link>
            <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
              {t('nav.products')}
            </Link>
            {user?.role === 'buyer' && (
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart</span>
                {cart.length > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">{cart.length}</span>}
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">
                {t('nav.dashboard')}
              </Link>
            )}
            <hr className="border-border" />
            {/* Language selector mobile */}
            <div className="flex gap-1">
              {(Object.keys(languageNames) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setMobileOpen(false); }}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    language === lang ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
            <hr className="border-border" />
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                {t('nav.logout')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">{t('nav.login')}</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">{t('nav.signup')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
