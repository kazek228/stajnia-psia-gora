import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  AlertTriangle,
  Clock,
  PawPrint,
  User,
  GraduationCap,
  Trash2,
  CheckCircle,
} from 'lucide-react';

const Horse = PawPrint;
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ScheduleData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string | null;
  price: number | null;
  paid: boolean;
  horse: { id: string; name: string; level: string };
  rider: { id: string; name: string; level: string };
  trainer: { id: string; name: string };
}

interface HorseData {
  id: string;
  name: string;
  level: string;
}

interface UserData {
  id: string;
  name: string;
  level?: string;
  specialization?: string;
}

const Schedule = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [horses, setHorses] = useState<HorseData[]>([]);
  const [riders, setRiders] = useState<UserData[]>([]);
  const [trainers, setTrainers] = useState<UserData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const [formData, setFormData] = useState({
    horseId: '',
    riderId: '',
    trainerId: '',
    startTime: '09:00',
    duration: 60,
    notes: '',
    price: '',
    paid: false,
  });

  const locale = language === 'pl' ? pl : enUS;

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [schedulesRes, horsesRes, ridersRes, trainersRes] = await Promise.all([
        api.get(`/schedules/date/${dateStr}`),
        api.get('/horses'),
        api.get('/users/riders'),
        api.get('/users/trainers'),
      ]);

      setSchedules(schedulesRes.data);
      setHorses(horsesRes.data);
      setRiders(ridersRes.data);
      setTrainers(trainersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      horseId: horses[0]?.id || '',
      riderId: riders[0]?.id || '',
      trainerId: trainers[0]?.id || '',
      startTime: '09:00',
      duration: 60,
      notes: '',
      price: '',
      paid: false,
    });
    setIsModalOpen(true);
    setError('');
    setWarning('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setWarning('');
  };

  const validateWelfare = async () => {
    try {
      const response = await api.post('/schedules/validate', {
        horseId: formData.horseId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: formData.startTime,
        duration: formData.duration,
      });

      if (!response.data.valid) {
        setError(response.data.errors.join('\n'));
        return false;
      }

      if (response.data.warnings?.length > 0) {
        setWarning(response.data.warnings.join('\n'));
      }

      return true;
    } catch (err) {
      return true; // Allow submission if validation fails
    }
  };

  const checkLevelMatch = () => {
    const horse = horses.find((h) => h.id === formData.horseId);
    const rider = riders.find((r) => r.id === formData.riderId);

    if (horse && rider && horse.level !== rider.level) {
      setWarning(
        `${t('levelMismatch')}: ${t('horses')}: ${getLevelLabel(horse.level)}, ${t('rider')}: ${getLevelLabel(rider.level || '')}`
      );
    } else {
      setWarning('');
    }
  };

  useEffect(() => {
    if (formData.horseId && formData.riderId) {
      checkLevelMatch();
    }
  }, [formData.horseId, formData.riderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isValid = await validateWelfare();
    if (!isValid) return;

    try {
      await api.post('/schedules', {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      fetchData();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.error || t('serverError'));
      if (err.response?.data?.details) {
        setError(err.response.data.details.join('\n'));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm') + '?')) return;

    try {
      await api.delete(`/schedules/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Zakończyć jazdę? Godziny zostaną odjęte z karnetu jeśli dotyczy.')) return;

    try {
      const response = await api.post(`/schedules/${id}/complete`);
      fetchData();
      if (response.data.remainingHours !== undefined) {
        alert(`Jazda zakończona. Pozostało ${response.data.remainingHours}h na karnecie.`);
      }
    } catch (error) {
      console.error('Failed to complete schedule:', error);
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

  // Generate week days
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const goToPreviousWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7));

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
          {t('sundayPlanner')}
        </h1>
        <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('addSession')}
        </button>
      </div>

      {/* Week navigation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-primary-800">
            {format(weekStart, 'MMMM yyyy', { locale })}
          </h2>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isSunday = day.getDay() === 0;
            const daySchedules = schedules.filter((s) =>
              isSameDay(new Date(s.date), day)
            );

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-lg'
                    : isSunday
                    ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="text-xs uppercase mb-1">
                  {format(day, 'EEE', { locale })}
                </p>
                <p className="text-lg font-semibold">{format(day, 'd')}</p>
                {daySchedules.length > 0 && (
                  <div
                    className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                      isSelected ? 'bg-white' : 'bg-primary-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule list */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-primary-800">
            {format(selectedDate, 'EEEE, d MMMM', { locale })}
          </h2>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('noSchedules')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((schedule) => {
                const levelMismatch = schedule.horse.level !== schedule.rider.level;

                return (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-xl border ${
                      levelMismatch
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary-800">
                            {schedule.startTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            - {schedule.endTime}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Horse className="w-4 h-4 text-primary-600" />
                            <span className="font-medium">{schedule.horse.name}</span>
                            <span className={getLevelBadge(schedule.horse.level)}>
                              {getLevelLabel(schedule.horse.level)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-earth-600" />
                            <span>{schedule.rider.name}</span>
                            <span className={getLevelBadge(schedule.rider.level)}>
                              {getLevelLabel(schedule.rider.level)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-forest-600" />
                            <span>{schedule.trainer.name}</span>
                          </div>

                          {schedule.price && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                              <span className="text-sm font-medium text-gray-700">
                                {schedule.price.toFixed(2)} PLN
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  schedule.paid
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {schedule.paid ? t('paid') : t('unpaid')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {levelMismatch && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">{t('levelMismatch')}</span>
                          </div>
                        )}
                        {schedule.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleComplete(schedule.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Zakończ jazdę"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {schedule.status === 'COMPLETED' && (
                          <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded">
                            ✓ Zakończono
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {schedule.notes && (
                      <p className="mt-3 text-sm text-gray-600 pl-16">
                        {schedule.notes}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-primary-800">{t('addSession')}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm whitespace-pre-line">{error}</span>
                </div>
              )}

              {warning && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm whitespace-pre-line">{warning}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('horses')} *
                </label>
                <select
                  value={formData.horseId}
                  onChange={(e) => setFormData({ ...formData, horseId: e.target.value })}
                  className="input"
                  required
                >
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} ({getLevelLabel(horse.level)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('rider')} *
                </label>
                <select
                  value={formData.riderId}
                  onChange={(e) => setFormData({ ...formData, riderId: e.target.value })}
                  className="input"
                  required
                >
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name} ({getLevelLabel(rider.level || '')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('trainer')} *
                </label>
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="input"
                  required
                >
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                      {trainer.specialization ? ` (${trainer.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('startTime')} *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('duration')} *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                    className="input"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('paid')}</label>
                  <div className="flex items-center h-10">
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.paid ? t('paid') : t('unpaid')}
                    </span>
                  </div>
                </div>
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

export default Schedule;
