import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Calendar, PawPrint, GraduationCap, Clock, Sparkles } from 'lucide-react';

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
  horse: { id: string; name: string; breed: string | null };
  trainer: { id: string; name: string };
}

const RiderPortal = () => {
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
      const response = await api.get('/schedules/my-schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextRide = () => {
    if (schedules.length === 0) return null;
    return schedules[0];
  };

  const nextRide = getNextRide();

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
      <div className="text-center">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800 mb-2">
          {t('welcome')}, {user?.name}! 🐴
        </h1>
        <p className="text-gray-600">{t('appNameShort')}</p>
      </div>

      {/* Next ride card */}
      {nextRide ? (
        <div className="card card-hover bg-gradient-to-br from-primary-50 to-earth-50 border-primary-200">
          <div className="flex items-center gap-2 mb-4 text-primary-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold">{t('yourRide')}</h2>
          </div>

          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
              <Horse className="w-10 h-10 text-primary-600" />
            </div>

            <p className="text-3xl md:text-4xl font-bold text-primary-800 mb-2">
              {nextRide.startTime}
            </p>

            <p className="text-xl text-primary-700 mb-4">
              {format(new Date(nextRide.date), 'EEEE, d MMMM', { locale })}
            </p>

            <div className="inline-block bg-white rounded-xl p-4 shadow-sm">
              <p className="text-lg font-semibold text-earth-700 mb-2">
                🐴 {nextRide.horse.name}
                {nextRide.horse.breed && (
                  <span className="text-sm font-normal text-gray-500">
                    {' '}
                    ({nextRide.horse.breed})
                  </span>
                )}
              </p>
              <p className="text-gray-600">
                👨‍🏫 {t('withTrainer', { trainer: nextRide.trainer.name })}
              </p>
            </div>

            {nextRide.notes && (
              <p className="mt-4 text-sm text-gray-600 italic">"{nextRide.notes}"</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('noUpcomingRides')}</h2>
          <p className="text-gray-500">
            {language === 'pl'
              ? 'Skontaktuj się z administracją, aby zarezerwować jazdę.'
              : 'Contact the administration to book a ride.'}
          </p>
        </div>
      )}

      {/* Upcoming rides list */}
      {schedules.length > 1 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('upcomingRides')}
          </h2>

          <div className="space-y-3">
            {schedules.slice(1).map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="text-center min-w-[80px]">
                  <p className="text-lg font-bold text-primary-800">{schedule.startTime}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(schedule.date), 'd MMM', { locale })}
                  </p>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Horse className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-primary-700">{schedule.horse.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{schedule.trainer.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{schedule.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderPortal;
