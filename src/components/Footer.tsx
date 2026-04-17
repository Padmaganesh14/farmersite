import { Sprout } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="font-heading text-lg font-bold">{t('footer.about')}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t('footer.aboutDesc')}</p>
          </div>
          <div>
            <h4 className="font-heading font-semibold">{t('footer.quickLinks')}</h4>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">{t('nav.home')}</Link>
              <Link to="/products" className="text-sm text-muted-foreground hover:text-primary">{t('nav.products')}</Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">{t('nav.login')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold">{t('footer.contact')}</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>support@uzhavarlink.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
