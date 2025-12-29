import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PawPrint, Eye, EyeOff, Globe, AlertCircle } from 'lucide-react';

const Horse = PawPrint;

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch {
      setError(t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nature-gradient flex items-center justify-center p-4 nature-pattern">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-forest-gradient rounded-full mb-4 shadow-lg">
            <Horse className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800 mb-2">
            {t('appName')}
          </h1>
          <p className="text-primary-600">{t('loginTitle')}</p>
        </div>

        {/* Login card */}
        <div className="card card-hover animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                t('login')
              )}
            </button>
          </form>

          {/* Language toggle */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'pl' ? 'English' : 'Polski'}</span>
            </button>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-white/50 rounded-xl text-center text-sm text-gray-600">
          <p className="font-medium mb-2">Demo:</p>
          <p>Admin: admin@stajnia.pl / admin123</p>
          <p>Jeździec: maria@example.com / rider123</p>
          <p>Stajenny: tomek@stajnia.pl / stable123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
