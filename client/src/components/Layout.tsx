import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  PawPrint,
  Users,
  Calendar,
  Utensils,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react';

// Note: lucide-react doesn't have a Horse icon, using PawPrint as a placeholder
const Horse = PawPrint;
import { useState, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
          { to: '/horses', icon: Horse, label: t('horses') },
          { to: '/users', icon: Users, label: t('riders') + ' & ' + t('trainers') },
          { to: '/schedule', icon: Calendar, label: t('schedule') },
          { to: '/feeding', icon: Utensils, label: t('feeding') },
        ];
      case 'RIDER':
        return [
          { to: '/my-rides', icon: Calendar, label: t('mySchedule') },
        ];
      case 'TRAINER':
        return [
          { to: '/my-schedule', icon: Calendar, label: t('mySchedule') },
        ];
      case 'STABLE_HAND':
        return [
          { to: '/feeding', icon: Utensils, label: t('feedingList') },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return t('admin');
      case 'RIDER':
        return t('rider');
      case 'TRAINER':
        return t('trainer');
      case 'STABLE_HAND':
        return t('stableHand');
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-nature-gradient">
      {/* Mobile header */}
      <header className="lg:hidden bg-forest-gradient text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <Horse className="w-8 h-8" />
          <span className="font-display font-semibold">{t('appNameShort')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span className="sr-only">{language.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-forest-gradient/95 backdrop-blur-sm animate-fade-in">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout')}</span>
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-forest-gradient text-white p-6 sticky top-0">
          <div className="flex items-center gap-3 mb-8">
            <Horse className="w-10 h-10" />
            <div>
              <h1 className="font-display font-semibold text-lg leading-tight">
                {t('appNameShort')}
              </h1>
              <p className="text-xs text-white/60">Psia Góra</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/20 pt-4 mt-4">
            <div className="px-4 py-2 mb-2">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-white/60">{getRoleName(user?.role || '')}</p>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full mb-2"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'pl' ? 'English' : 'Polski'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
