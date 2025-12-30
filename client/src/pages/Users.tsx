import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Users, Plus, Pencil, Trash2, X, AlertCircle, GraduationCap, User, Shield } from 'lucide-react';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  level?: string;
  specialization?: string;
  paymentMethod?: string;
  subscriptionHours?: number;
}

// Helper to check if user has a specific role
const hasRole = (userRole: string, role: string) => {
  return userRole.split(',').includes(role);
};

const UsersPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  
  // Get initial tab from URL or default to RIDER
  const getInitialTab = (): 'RIDER' | 'TRAINER' | 'STABLE_HAND' => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'trainers') return 'TRAINER';
    if (tabParam === 'stable_hands') return 'STABLE_HAND';
    return 'RIDER';
  };
  
  const [activeTab, setActiveTab] = useState<'RIDER' | 'TRAINER' | 'STABLE_HAND'>(getInitialTab());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
    level: 'BEGINNER',
    specialization: '',
    paymentMethod: 'CASH',
    subscriptionHours: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        roles: user.role.split(','),
        level: user.level || 'BEGINNER',
        specialization: user.specialization || '',
        paymentMethod: user.paymentMethod || 'CASH',
        subscriptionHours: user.subscriptionHours || 0,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        roles: [activeTab],
        level: 'BEGINNER',
        specialization: '',
        paymentMethod: 'CASH',
        subscriptionHours: 0,
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError('');
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.roles.length === 0) {
      setError('Wybierz przynajmniej jedną rolę');
      return;
    }

    // Jeśli tylko RIDER - generuj losowy email i hasło (nie będą używane do logowania)
    const isOnlyRider = formData.roles.length === 1 && formData.roles[0] === 'RIDER';
    const emailToUse = isOnlyRider && !formData.email 
      ? `rider_${Date.now()}@nologin.local` 
      : formData.email;
    const passwordToUse = isOnlyRider && !formData.password 
      ? Math.random().toString(36).slice(-12) 
      : formData.password;

    try {
      const roleString = formData.roles.join(',');
      
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: isOnlyRider ? editingUser.email : formData.email, // Nie zmieniaj email dla RIDER
          role: roleString,
        };
        if (formData.password && !isOnlyRider) {
          updateData.password = formData.password;
        }
        if (formData.roles.includes('RIDER')) {
          updateData.level = formData.level;
          updateData.paymentMethod = formData.paymentMethod;
          updateData.subscriptionHours = formData.paymentMethod === 'SUBSCRIPTION' 
            ? formData.subscriptionHours 
            : null;
        }
        if (formData.roles.includes('TRAINER')) {
          updateData.specialization = formData.specialization;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        await api.post('/auth/register', { 
          ...formData, 
          email: emailToUse,
          password: passwordToUse,
          role: roleString,
          paymentMethod: formData.roles.includes('RIDER') ? formData.paymentMethod : null,
          subscriptionHours: formData.paymentMethod === 'SUBSCRIPTION' ? formData.subscriptionHours : null,
        });
      }
      fetchUsers();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || t('serverError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm') + '?')) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const filteredUsers = users.filter((user) => hasRole(user.role, activeTab));

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'badge badge-green';
      case 'INTERMEDIATE':
        return 'badge badge-yellow';
      case 'ADVANCED':
        return 'badge badge-red';
      default:
        return 'badge';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return t('beginner');
      case 'INTERMEDIATE':
        return t('intermediate');
      case 'ADVANCED':
        return t('advanced');
      default:
        return level;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800">
          {t('riders')} & {t('trainers')}
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-5 h-5" />
          {t('add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('RIDER')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'RIDER'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          {t('riders')} ({users.filter((u) => hasRole(u.role, 'RIDER')).length})
        </button>
        <button
          onClick={() => setActiveTab('TRAINER')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'TRAINER'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 inline mr-2" />
          {t('trainers')} ({users.filter((u) => hasRole(u.role, 'TRAINER')).length})
        </button>
        <button
          onClick={() => setActiveTab('STABLE_HAND')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'STABLE_HAND'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          {t('stableHand')} ({users.filter((u) => hasRole(u.role, 'STABLE_HAND')).length})
        </button>
      </div>

      {/* Users list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  {hasRole(user.role, 'TRAINER') ? (
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-primary-800">{user.name}</h3>
                  {/* Pokaż email tylko jeśli użytkownik może się logować (nie tylko RIDER) */}
                  {user.role !== 'RIDER' && !user.email?.includes('@nologin.local') && (
                    <p className="text-sm text-gray-500">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                {hasRole(user.role, 'ADMIN') && (
                  <span className="badge bg-purple-100 text-purple-700 whitespace-nowrap">
                    <Shield className="w-3 h-3 inline mr-1" />Admin
                  </span>
                )}
                {user.level && (
                  <span className={getLevelBadge(user.level) + ' whitespace-nowrap'}>{getLevelLabel(user.level)}</span>
                )}
              </div>
            </div>

            {user.specialization && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Specjalizacja:</span> {user.specialization}
              </p>
            )}

            {/* Payment info for riders */}
            {hasRole(user.role, 'RIDER') && user.paymentMethod && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Płatność:</span>{' '}
                {user.paymentMethod === 'CASH' && 'Gotówka'}
                {user.paymentMethod === 'BLIK' && 'BLIK'}
                {user.paymentMethod === 'SUBSCRIPTION' && (
                  <span className="inline-flex items-center gap-1">
                    Karnet 
                    <span className={`font-bold ${(user.subscriptionHours || 0) <= 1 ? 'text-red-600' : 'text-green-600'}`}>
                      ({user.subscriptionHours || 0}h)
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Show all roles */}
            <div className="flex flex-wrap gap-1 mb-4">
              {user.role.split(',').map((role) => (
                <span key={role} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {role === 'ADMIN' ? 'Admin' : role === 'TRAINER' ? t('trainer') : role === 'RIDER' ? t('rider') : t('stableHand')}
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => openModal(user)}
                className="btn btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                {t('edit')}
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="btn btn-danger flex items-center justify-center gap-2 px-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No {activeTab.toLowerCase()}s yet.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-primary-800">
                {editingUser ? t('edit') : t('add')} {t(activeTab.toLowerCase())}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('riderName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {/* Email i hasło tylko dla ról innych niż RIDER lub gdy jest więcej ról */}
              {(formData.roles.length === 0 || formData.roles.some(r => r !== 'RIDER')) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('password')} {editingUser ? '' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      required={!editingUser}
                      placeholder={editingUser ? 'Leave empty to keep current' : ''}
                    />
                  </div>
                </>
              )}

              {/* Info dla samych jeźdźców */}
              {formData.roles.length === 1 && formData.roles[0] === 'RIDER' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Jeźdźcy nie mają możliwości logowania - są tylko przypisywani do sesji treningowych.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role * (można wybrać kilka)</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('RIDER')}
                      onChange={() => toggleRole('RIDER')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>{t('rider')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('TRAINER')}
                      onChange={() => toggleRole('TRAINER')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>{t('trainer')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('STABLE_HAND')}
                      onChange={() => toggleRole('STABLE_HAND')}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span>{t('stableHand')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes('ADMIN')}
                      onChange={() => toggleRole('ADMIN')}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Admin
                    </span>
                  </label>
                </div>
              </div>

              {formData.roles.includes('RIDER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('level')} *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="input"
                  >
                    <option value="BEGINNER">{t('beginner')}</option>
                    <option value="INTERMEDIATE">{t('intermediate')}</option>
                    <option value="ADVANCED">{t('advanced')}</option>
                  </select>
                </div>
              )}

              {formData.roles.includes('RIDER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Płatność
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="input"
                  >
                    <option value="CASH">Gotówka</option>
                    <option value="BLIK">BLIK</option>
                    <option value="SUBSCRIPTION">Karnet</option>
                  </select>
                </div>
              )}

              {formData.roles.includes('RIDER') && formData.paymentMethod === 'SUBSCRIPTION' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Godziny z karnetu
                  </label>
                  <input
                    type="number"
                    value={formData.subscriptionHours}
                    onChange={(e) => setFormData({ ...formData, subscriptionHours: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                    step="0.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pozostałe godziny do wykorzystania. Odejmowane automatycznie po jazdie.
                  </p>
                </div>
              )}

              {formData.roles.includes('TRAINER') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specjalizacja
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="input"
                    placeholder="np. Ujeżdżenie, Skoki"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn btn-outline flex-1">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
