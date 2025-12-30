import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PawPrint, Plus, Pencil, Trash2, X, AlertCircle } from 'lucide-react';

const Horse = PawPrint;
import api from '../services/api';

interface HorseData {
  id: string;
  name: string;
  breed: string | null;
  level: string;
  maxWorkHours: number;
  restAfterWork: number;
  postTrainingMeal: string | null;
  notes: string | null;
  isActive: boolean;
}

const Horses = () => {
  const { t } = useTranslation();
  const [horses, setHorses] = useState<HorseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<HorseData | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    level: 'BEGINNER',
    maxWorkHours: 4,
    restAfterWork: 1,
    postTrainingMeal: '',
    notes: '',
  });

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    try {
      const response = await api.get('/horses');
      setHorses(response.data);
    } catch (error) {
      console.error('Failed to fetch horses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (horse?: HorseData) => {
    if (horse) {
      setEditingHorse(horse);
      setFormData({
        name: horse.name,
        breed: horse.breed || '',
        level: horse.level,
        maxWorkHours: horse.maxWorkHours,
        restAfterWork: horse.restAfterWork,
        postTrainingMeal: horse.postTrainingMeal || '',
        notes: horse.notes || '',
      });
    } else {
      setEditingHorse(null);
      setFormData({
        name: '',
        breed: '',
        level: 'BEGINNER',
        maxWorkHours: 4,
        restAfterWork: 1,
        postTrainingMeal: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHorse(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingHorse) {
        await api.put(`/horses/${editingHorse.id}`, formData);
      } else {
        await api.post('/horses', formData);
      }
      fetchHorses();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || t('serverError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm') + '?')) return;

    try {
      await api.delete(`/horses/${id}`);
      fetchHorses();
    } catch (error) {
      console.error('Failed to delete horse:', error);
    }
  };

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
          {t('horses')}
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('addHorse')}
        </button>
      </div>

      {/* Horses grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {horses.map((horse) => (
          <div key={horse.id} className="card card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Horse className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-800">{horse.name}</h3>
                  {horse.breed && <p className="text-sm text-gray-500">{horse.breed}</p>}
                </div>
              </div>
              <span className={getLevelBadge(horse.level)}>{getLevelLabel(horse.level)}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('maxWorkHours')}:</span>
                <span className="font-medium">{horse.maxWorkHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('restAfterWork')}:</span>
                <span className="font-medium">{horse.restAfterWork}h</span>
              </div>
              {horse.postTrainingMeal && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-600 mb-1">{t('postTrainingMeal')}:</p>
                  <p className="text-primary-700">{horse.postTrainingMeal}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => openModal(horse)}
                className="btn btn-outline flex-1 flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                {t('edit')}
              </button>
              <button
                onClick={() => handleDelete(horse.id)}
                className="btn btn-danger flex items-center justify-center gap-2 px-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {horses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Horse className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No horses yet. Add your first horse!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-primary-800">
                {editingHorse ? t('editHorse') : t('addHorse')}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('breed')}</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="input"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maxWorkHours')} *
                  </label>
                  <input
                    type="number"
                    value={formData.maxWorkHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({ ...formData, maxWorkHours: isNaN(val) || val < 1 ? 1 : Math.min(val, 8) });
                    }}
                    className="input"
                    min="1"
                    max="8"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('restAfterWork')} *
                  </label>
                  <input
                    type="number"
                    value={formData.restAfterWork}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData({ ...formData, restAfterWork: isNaN(val) || val < 1 ? 1 : Math.min(val, 24) });
                    }}
                    className="input"
                    min="1"
                    max="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postTrainingMeal')}
                </label>
                <textarea
                  value={formData.postTrainingMeal}
                  onChange={(e) => setFormData({ ...formData, postTrainingMeal: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="np. 1 miarka meszu, 50g marchewki"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>

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

export default Horses;
