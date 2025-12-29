import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Pencil, Trash2, X, AlertCircle, GraduationCap, User } from 'lucide-react';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  level?: string;
  specialization?: string;
}

const UsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'RIDER' | 'TRAINER' | 'STABLE_HAND'>('RIDER');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RIDER',
    level: 'BEGINNER',
    specialization: '',
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
        role: user.role,
        level: user.level || 'BEGINNER',
        specialization: user.specialization || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: activeTab,
        level: 'BEGINNER',
        specialization: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        if (formData.role === 'RIDER') {
          updateData.level = formData.level;
        }
        if (formData.role === 'TRAINER') {
          updateData.specialization = formData.specialization;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        await api.post('/auth/register', formData);
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

  const filteredUsers = users.filter((user) => user.role === activeTab);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800">
          {t('riders')} & {t('trainers')}
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('add')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('RIDER')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'RIDER'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          {t('riders')} ({users.filter((u) => u.role === 'RIDER').length})
        </button>
        <button
          onClick={() => setActiveTab('TRAINER')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'TRAINER'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 inline mr-2" />
          {t('trainers')} ({users.filter((u) => u.role === 'TRAINER').length})
        </button>
        <button
          onClick={() => setActiveTab('STABLE_HAND')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'STABLE_HAND'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          {t('stableHand')} ({users.filter((u) => u.role === 'STABLE_HAND').length})
        </button>
      </div>

      {/* Users list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  {user.role === 'TRAINER' ? (
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-primary-800">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {user.level && (
                <span className={getLevelBadge(user.level)}>{getLevelLabel(user.level)}</span>
              )}
            </div>

            {user.specialization && (
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Specjalizacja:</span> {user.specialization}
              </p>
            )}

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
                  {t('horseName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

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

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input"
                  >
                    <option value="RIDER">{t('rider')}</option>
                    <option value="TRAINER">{t('trainer')}</option>
                    <option value="STABLE_HAND">{t('stableHand')}</option>
                  </select>
                </div>
              )}

              {(formData.role === 'RIDER' || (editingUser && editingUser.role === 'RIDER')) && (
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

              {(formData.role === 'TRAINER' ||
                (editingUser && editingUser.role === 'TRAINER')) && (
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
