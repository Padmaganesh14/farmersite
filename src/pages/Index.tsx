import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sprout, Package, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Sprout, title: t('feature.freshProduce'), desc: t('feature.freshProduceDesc') },
    { icon: Package, title: t('feature.noMiddlemen'), desc: t('feature.noMiddlemenDesc') },
    { icon: Truck, title: t('feature.liveTracking'), desc: t('feature.liveTrackingDesc') },
    { icon: ShieldCheck, title: t('feature.trusted'), desc: t('feature.trustedDesc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(142_64%_32%/0.06),transparent_70%)]" />
        <div className="container relative mx-auto animate-fade-in">
          <div className="mx-auto flex justify-center">
            <Sprout className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="font-heading text-base">{t('hero.getStarted')}</Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="font-heading text-base">{t('hero.browseProducts')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-4 py-16">
        <div className="container mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="animate-slide-up card-shadow rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="container mx-auto">
          <h2 className="font-heading text-3xl font-bold text-foreground">
            {t('hero.getStarted')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t('hero.subtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg">{t('auth.signup')}</Button>
            </Link>
          </div>
          {/* Demo credentials */}
          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-border bg-accent/50 p-4 text-left text-sm">
            <p className="font-semibold text-foreground">Demo Credentials:</p>
            <p className="mt-1 text-muted-foreground">Farmer: farmer@demo.com / demo123</p>
            <p className="text-muted-foreground">Buyer: buyer@demo.com / demo123</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
