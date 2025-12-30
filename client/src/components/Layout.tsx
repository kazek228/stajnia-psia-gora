import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, hasRole } from '../context/AuthContext';
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
    const items: { to: string; icon: typeof LayoutDashboard; label: string }[] = [];
    
    // Admin gets full access
    if (hasRole(user, 'ADMIN')) {
      items.push(
        { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { to: '/horses', icon: Horse, label: t('horses') },
        { to: '/users', icon: Users, label: t('riders') + ' & ' + t('trainers') },
        { to: '/schedule', icon: Calendar, label: t('schedule') },
        { to: '/feeding', icon: Utensils, label: t('feeding') }
      );
    } else {
      // Non-admin roles get their specific menu items
      // Note: RIDER alone cannot log in, so no menu needed for them
      if (hasRole(user, 'TRAINER')) {
        items.push({ to: '/my-schedule', icon: Calendar, label: t('mySchedule') });
      }
      if (hasRole(user, 'STABLE_HAND')) {
        items.push({ to: '/feeding', icon: Utensils, label: t('feedingList') });
      }
    }
    
    return items;
  };

  const navItems = getNavItems();

  const getSingleRoleName = (role: string) => {
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

  const getRoleNames = (roleString: string) => {
    if (!roleString) return '';
    return roleString.split(',').map(r => getSingleRoleName(r.trim())).join(', ');
  };

  return (
    <div className="min-h-screen bg-nature-gradient">
      {/* Mobile header */}
      <header className="lg:hidden bg-forest-gradient text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg h-16">
        <div className="flex items-center gap-3">
          <Horse className="w-8 h-8" />
          <span className="font-display font-semibold text-sm">{t('appNameShort')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={language.toUpperCase()}
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div className={`lg:hidden fixed top-16 right-0 bottom-0 w-72 max-w-[85vw] z-50 bg-forest-gradient transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* User info */}
          <div className="p-4 border-b border-white/20">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-sm text-white/60">{getRoleNames(user?.role || '')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
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
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/20 space-y-2">
            <button
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'pl' ? 'English' : 'Polski'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

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
              <p className="text-sm text-white/60">{getRoleNames(user?.role || '')}</p>
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
