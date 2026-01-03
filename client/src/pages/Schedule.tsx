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
  Pencil,
  Copy,
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
  trainer: { id: string; name: string; color?: string };
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

interface HorseWorkload {
  id: string;
  name: string;
  totalMinutes: number;
  maxMinutes: number;
  workloadPercent: number;
  status: 'green' | 'yellow' | 'red';
  schedulesCount: number;
}

const Schedule = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [horses, setHorses] = useState<HorseData[]>([]);
  const [riders, setRiders] = useState<UserData[]>([]);
  const [trainers, setTrainers] = useState<UserData[]>([]);
  const [horseWorkloads, setHorseWorkloads] = useState<HorseWorkload[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleData | null>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [initialDateSet, setInitialDateSet] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTargetDates, setSelectedTargetDates] = useState<Date[]>([]);
  const [copyError, setCopyError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

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

  // Find first non-empty day with schedules
  useEffect(() => {
    const findFirstScheduleDay = async () => {
      if (initialDateSet) return;
      
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check next 30 days for schedules
        for (let i = 0; i < 30; i++) {
          const checkDate = addDays(today, i);
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const response = await api.get(`/schedules/date/${dateStr}`);
          
          if (response.data && response.data.length > 0) {
            setSelectedDate(checkDate);
            setInitialDateSet(true);
            return;
          }
        }
        
        // If no schedules found in next 30 days, stay on today
        setInitialDateSet(true);
      } catch (error) {
        console.error('Failed to find first schedule day:', error);
        setInitialDateSet(true);
      }
    };

    findFirstScheduleDay();
  }, [initialDateSet]);

  useEffect(() => {
    if (initialDateSet) {
      fetchData();
    }
  }, [selectedDate, initialDateSet]);

  const fetchData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [schedulesRes, horsesRes, ridersRes, trainersRes, workloadRes] = await Promise.all([
        api.get(`/schedules/date/${dateStr}`),
        api.get('/horses'),
        api.get('/users/riders'),
        api.get('/users/trainers'),
        api.get(`/schedules/workload/${dateStr}`),
      ]);

      setSchedules(schedulesRes.data);
      setHorses(horsesRes.data);
      setRiders(ridersRes.data);
      setTrainers(trainersRes.data);
      setHorseWorkloads(workloadRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setEditingSchedule(null);
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

  const openEditModal = (schedule: ScheduleData) => {
    setEditingSchedule(schedule);
    setFormData({
      horseId: schedule.horse.id,
      riderId: schedule.rider.id,
      trainerId: schedule.trainer.id,
      startTime: schedule.startTime,
      duration: schedule.duration,
      notes: schedule.notes || '',
      price: schedule.price?.toString() || '',
      paid: schedule.paid,
    });
    setIsModalOpen(true);
    setError('');
    setWarning('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setError('');
    setWarning('');
  };

  const openCopyModal = () => {
    if (schedules.length === 0) {
      alert(t('noSchedulesToCopy') || 'Brak jazd do skopiowania');
      return;
    }
    setIsCopyModalOpen(true);
    setSelectedTargetDates([]);
    setCopyError('');
    setCopySuccess('');
  };

  const closeCopyModal = () => {
    setIsCopyModalOpen(false);
    setSelectedTargetDates([]);
    setCopyError('');
    setCopySuccess('');
  };

  const toggleDateSelection = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (dateStr === currentDateStr) return; // Can't copy to same day

    setSelectedTargetDates(prev => {
      const exists = prev.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      if (exists) {
        return prev.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleCopySchedule = async () => {
    if (selectedTargetDates.length === 0) {
      setCopyError('Wybierz przynajmniej jeden dzień docelowy');
      return;
    }

    try {
      const response = await api.post('/schedules/copy-day', {
        sourceDate: format(selectedDate, 'yyyy-MM-dd'),
        targetDates: selectedTargetDates.map(d => format(d, 'yyyy-MM-dd')),
      });

      setCopySuccess(`Skopiowano ${response.data.copiedCount} z ${response.data.totalAttempts} jazd`);
      if (response.data.errors && response.data.errors.length > 0) {
        setCopyError(`Błędy:\n${response.data.errors.slice(0, 5).join('\n')}`);
      }
      
      setTimeout(() => {
        closeCopyModal();
        fetchData();
      }, 2000);
    } catch (err: any) {
      setCopyError(err.response?.data?.error || 'Błąd podczas kopiowania');
    }
  };

  const validateWelfare = async () => {
    try {
      const response = await api.post('/schedules/validate', {
        horseId: formData.horseId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: formData.startTime,
        duration: formData.duration,
        scheduleId: editingSchedule?.id,
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

  const getLevelValue = (level: string): number => {
    switch (level) {
      case 'BEGINNER':
        return 1;
      case 'INTERMEDIATE':
        return 2;
      case 'ADVANCED':
        return 3;
      default:
        return 0;
    }
  };

  const checkLevelMatch = () => {
    const horse = horses.find((h) => h.id === formData.horseId);
    const rider = riders.find((r) => r.id === formData.riderId);

    if (horse && rider) {
      const horseLevel = getLevelValue(horse.level);
      const riderLevel = getLevelValue(rider.level || '');
      
      // Warning only if rider is less experienced than horse
      if (riderLevel < horseLevel) {
        setWarning(
          `${t('levelMismatch')}: ${t('horses')}: ${getLevelLabel(horse.level)}, ${t('rider')}: ${getLevelLabel(rider.level || '')}`
        );
      } else {
        setWarning('');
      }
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
      if (editingSchedule) {
        // Update existing schedule
        await api.put(`/schedules/${editingSchedule.id}`, {
          ...formData,
          date: format(selectedDate, 'yyyy-MM-dd'),
        });
      } else {
        // Create new schedule
        await api.post('/schedules', {
          ...formData,
          date: format(selectedDate, 'yyyy-MM-dd'),
        });
      }
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
        <div className="flex gap-2">
          <button onClick={openCopyModal} className="btn btn-outline flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Kopiuj dzień
          </button>
          <button onClick={openModal} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('addSession')}
          </button>
        </div>
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

      {/* Horse Workload for selected date */}
      {horseWorkloads.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Horse className="w-5 h-5" />
            {t('horseWorkload')} - {format(selectedDate, 'd MMMM', { locale })}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {horseWorkloads.filter(w => w.schedulesCount > 0).map((workload) => (
              <div
                key={workload.id}
                className={`p-4 rounded-xl border-2 ${
                  workload.status === 'green'
                    ? 'bg-green-50 border-green-200'
                    : workload.status === 'yellow'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{workload.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      workload.status === 'green'
                        ? 'bg-green-100 text-green-700'
                        : workload.status === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {workload.workloadPercent}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{workload.totalMinutes} min / {workload.maxMinutes} min</p>
                  <p className="text-xs mt-1">{workload.schedulesCount} {workload.schedulesCount === 1 ? 'jazda' : 'jazd'}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      workload.status === 'green'
                        ? 'bg-green-500'
                        : workload.status === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(workload.workloadPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <div className="space-y-1">
            {/* Group schedules by start time */}
            {Array.from(new Set(schedules.map(s => s.startTime)))
              .sort()
              .map((timeSlot) => {
                const schedulesAtTime = schedules.filter(s => s.startTime === timeSlot);
                
                return (
                  <div key={timeSlot} className="flex gap-2">
                    {/* Time column */}
                    <div className="w-20 flex-shrink-0 py-2">
                      <p className="text-lg font-bold text-primary-800 text-right">{timeSlot}</p>
                    </div>
                    
                    {/* Sessions at this time */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {schedulesAtTime.map((schedule) => {
                        const horseLevel = getLevelValue(schedule.horse.level);
                        const riderLevel = getLevelValue(schedule.rider.level);
                        const levelMismatch = riderLevel < horseLevel; // Warning only if rider less experienced than horse

                        return (
                          <div
                            key={schedule.id}
                            className={`p-3 rounded-lg border ${
                              levelMismatch
                                ? 'border-yellow-400 border-2'
                                : 'border-gray-300'
                            }`}
                            style={{
                              backgroundColor: schedule.trainer.color 
                                ? `${schedule.trainer.color}15` 
                                : levelMismatch ? '#fef3c7' : '#f9fafb',
                              borderLeftWidth: '4px',
                              borderLeftColor: schedule.trainer.color || '#d1d5db'
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                <div className="flex items-center gap-1">
                                  {levelMismatch && (
                                    <div className="text-yellow-600" title={t('levelMismatch')}>
                                      <AlertTriangle className="w-3 h-3" />
                                    </div>
                                  )}
                                  {schedule.status !== 'COMPLETED' && (
                                    <button
                                      onClick={() => handleComplete(schedule.id)}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Zakończ jazdę"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                    </button>
                                  )}
                                  {schedule.status === 'COMPLETED' && (
                                    <span className="text-xs text-green-600">✓</span>
                                  )}
                                  <button
                                    onClick={() => openEditModal(schedule)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title={t('edit')}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Horse className="w-3 h-3 text-primary-600 flex-shrink-0" />
                                <span className="font-medium text-sm truncate">{schedule.horse.name}</span>
                                <span className={getLevelBadge(schedule.horse.level) + ' text-xs'}>
                                  {getLevelLabel(schedule.horse.level).substring(0, 3)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-earth-600 flex-shrink-0" />
                                <span className="text-sm truncate">{schedule.rider.name}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-3 h-3 text-forest-600 flex-shrink-0" />
                                <span className="text-sm truncate">{schedule.trainer.name}</span>
                              </div>

                              {schedule.price && (
                                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                                  <span className="text-xs font-medium text-gray-700">
                                    {schedule.price.toFixed(2)} PLN
                                  </span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded ${
                                      schedule.paid
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {schedule.paid ? '✓' : '✗'}
                                  </span>
                                </div>
                              )}

                              {schedule.notes && (
                                <p className="text-xs text-gray-600 truncate" title={schedule.notes}>
                                  {schedule.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
              <h2 className="text-xl font-semibold text-primary-800">
                {editingSchedule ? t('editSession') : t('addSession')}
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
                    <option value={15}>15 min</option>
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

      {/* Copy Day Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-primary-800 flex items-center gap-2">
                <Copy className="w-5 h-5" />
                Kopiuj harmonogram z {format(selectedDate, 'd MMMM', { locale })}
              </h2>
              <button
                onClick={closeCopyModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {copyError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm whitespace-pre-line">{copyError}</span>
                </div>
              )}

              {copySuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{copySuccess}</span>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Źródło: {schedules.length} {schedules.length === 1 ? 'jazda' : 'jazd'} zaplanowanych
                </p>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Wybierz dni, do których chcesz skopiować harmonogram:
                </p>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i);
                    const isSelected = selectedTargetDates.some(d => 
                      format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    const isSourceDay = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDateSelection(date)}
                        disabled={isSourceDay || isPast}
                        className={`
                          p-2 rounded-lg text-sm font-medium transition-all
                          ${isSourceDay 
                            ? 'bg-primary-600 text-white cursor-not-allowed' 
                            : isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        <div className="text-xs">{format(date, 'EEE', { locale })}</div>
                        <div>{format(date, 'd')}</div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  🔵 = Dzień źródłowy
                  {selectedTargetDates.length > 0 && ` | ✅ Wybrano: ${selectedTargetDates.length}`}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeCopyModal} 
                  className="btn btn-outline flex-1"
                >
                  Anuluj
                </button>
                <button 
                  type="button"
                  onClick={handleCopySchedule}
                  disabled={selectedTargetDates.length === 0}
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kopiuj do {selectedTargetDates.length} {selectedTargetDates.length === 1 ? 'dnia' : 'dni'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
