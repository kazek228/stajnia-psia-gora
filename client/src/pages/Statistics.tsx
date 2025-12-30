import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import api from '../lib/api';

interface WorkStats {
  period: 'day' | 'month' | 'all';
  date: string | null;
  trainers: Array<{
    id: string;
    name: string;
    totalMinutes: number;
    totalHours: number;
    sessions: number;
  }>;
  horses: Array<{
    id: string;
    name: string;
    totalMinutes: number;
    totalHours: number;
    sessions: number;
  }>;
  totalSessions: number;
}

export default function Statistics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'all'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  useEffect(() => {
    fetchStats();
  }, [viewMode, selectedDate, selectedMonth]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let params: any = {};
      
      if (viewMode === 'day') {
        params.date = selectedDate;
      } else if (viewMode === 'month') {
        params.month = selectedMonth;
      }

      const response = await api.get('/stats/work', { params });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (viewMode === 'day') return t('dailyStats');
    if (viewMode === 'month') return t('monthlyStats');
    return t('allTimeStats');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            {t('workStatistics')}
          </h1>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'day'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('dailyStats')}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'month'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('monthlyStats')}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('allTimeStats')}
            </button>
          </div>

          {viewMode === 'day' && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}

          {viewMode === 'month' && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {stats && stats.totalSessions > 0 && (
          <div className="mt-4 flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-5 w-5" />
            <span>
              {t('sessions')}: <strong>{stats.totalSessions}</strong>
            </span>
          </div>
        )}
      </div>

      {!stats || stats.totalSessions === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t('noDataForPeriod')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trainer Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              {t('trainerWorkload')}
            </h2>
            
            {stats.trainers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noDataForPeriod')}</p>
            ) : (
              <div className="space-y-3">
                {stats.trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{trainer.name}</h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {trainer.totalHours}h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t('sessions')}: {trainer.sessions}</span>
                      <span>{trainer.totalMinutes} min</span>
                    </div>
                    <div className="mt-2 bg-blue-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (trainer.totalHours / Math.max(...stats.trainers.map((t) => t.totalHours))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horse Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-amber-600" />
              {t('horseWorkload2')}
            </h2>
            
            {stats.horses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noDataForPeriod')}</p>
            ) : (
              <div className="space-y-3">
                {stats.horses.map((horse) => (
                  <div
                    key={horse.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{horse.name}</h3>
                      <span className="text-2xl font-bold text-amber-600">
                        {horse.totalHours}h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{t('sessions')}: {horse.sessions}</span>
                      <span>{horse.totalMinutes} min</span>
                    </div>
                    <div className="mt-2 bg-amber-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (horse.totalHours / Math.max(...stats.horses.map((h) => h.totalHours))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
