import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Calendar, PawPrint, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Horse = PawPrint;
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface ScheduleData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string | null;
  horse: { id: string; name: string };
  rider: { id: string; name: string; level: string };
}

const TrainerSchedule = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const locale = language === 'pl' ? pl : enUS;

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules/trainer-schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setIsLoading(false);
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

  // Group schedules by date
  const groupedSchedules = schedules.reduce<Record<string, ScheduleData[]>>((acc, schedule) => {
    const dateKey = format(new Date(schedule.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedules).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800 mb-2">
          {t('welcome')}, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {user?.specialization && (
            <span className="inline-flex items-center gap-1">
              <span className="font-medium">{user.specialization}</span>
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{schedules.length}</p>
              <p className="text-sm text-gray-600">{t('upcomingRides')}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-earth-100 rounded-xl">
              <Clock className="w-6 h-6 text-earth-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">
                {schedules.reduce((sum, s) => sum + s.duration, 0)} min
              </p>
              <p className="text-sm text-gray-600">
                {language === 'pl' ? 'Łączny czas' : 'Total time'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule by day */}
      {sortedDates.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('noSchedules')}</h2>
          <p className="text-gray-500">
            {language === 'pl'
              ? 'Brak zaplanowanych lekcji.'
              : 'No scheduled lessons.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="card">
              <h2 className="text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(new Date(dateKey), 'EEEE, d MMMM', { locale })}
              </h2>

              <div className="space-y-3">
                {groupedSchedules[dateKey]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="text-center min-w-[80px]">
                        <p className="text-xl font-bold text-primary-800">{schedule.startTime}</p>
                        <p className="text-xs text-gray-500">- {schedule.endTime}</p>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-earth-600" />
                          <span className="font-medium">{schedule.rider.name}</span>
                          <span className={getLevelBadge(schedule.rider.level)}>
                            {getLevelLabel(schedule.rider.level)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Horse className="w-4 h-4 text-primary-600" />
                          <span className="text-gray-600">{schedule.horse.name}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          {schedule.duration} min
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerSchedule;
