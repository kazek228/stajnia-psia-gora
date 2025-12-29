import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PawPrint, Users, GraduationCap, Calendar, TrendingUp } from 'lucide-react';

const Horse = PawPrint;
import api from '../services/api';

interface DashboardStats {
  horses: number;
  riders: number;
  trainers: number;
  todaySchedules: number;
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

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [horseWorkloads, setHorseWorkloads] = useState<HorseWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data.stats);
        setHorseWorkloads(response.data.horseWorkloads);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-800">
          {t('dashboard')}
        </h1>
        <p className="text-gray-600 mt-1">{t('welcome')}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Horse className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{stats?.horses || 0}</p>
              <p className="text-sm text-gray-600">{t('totalHorses')}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-earth-100 rounded-xl">
              <Users className="w-6 h-6 text-earth-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{stats?.riders || 0}</p>
              <p className="text-sm text-gray-600">{t('totalRiders')}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-forest-100 rounded-xl">
              <GraduationCap className="w-6 h-6 text-forest-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{stats?.trainers || 0}</p>
              <p className="text-sm text-gray-600">{t('totalTrainers')}</p>
            </div>
          </div>
        </div>

        <div className="card card-hover">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-800">{stats?.todaySchedules || 0}</p>
              <p className="text-sm text-gray-600">{t('todaySchedules')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horse workloads */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-primary-800">{t('horseWorkloads')}</h2>
        </div>

        {horseWorkloads.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('noSchedules')}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {horseWorkloads.map((horse) => (
              <div
                key={horse.id}
                className={`p-4 rounded-xl border ${getStatusBg(horse.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Horse className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-primary-800">{horse.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {horse.schedulesCount} {horse.schedulesCount === 1 ? 'ride' : 'rides'}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t('workload')}</span>
                    <span className="font-medium">{horse.workloadPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getStatusColor(horse.status)}`}
                      style={{ width: `${Math.min(horse.workloadPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {Math.round(horse.totalMinutes / 60 * 10) / 10}h / {horse.maxMinutes / 60}h
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
