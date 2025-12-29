import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Utensils, Check, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface FeedingTask {
  id: string;
  horseName: string;
  endTime: string;
  mealDescription: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
  completedBy: string | null;
}

const Feeding = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [tasks, setTasks] = useState<FeedingTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const locale = language === 'pl' ? pl : enUS;

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await api.get(`/feeding/date/${dateStr}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch feeding tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTasks = async () => {
    setIsGenerating(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await api.post(`/feeding/generate/${dateStr}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to generate feeding tasks:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.put(`/feeding/${taskId}/uncomplete`);
      } else {
        await api.put(`/feeding/${taskId}/complete`);
      }
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

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
          {t('feedingList')}
        </h1>
        <button
          onClick={generateTasks}
          disabled={isGenerating}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          {language === 'pl' ? 'Generuj listę' : 'Generate list'}
        </button>
      </div>

      {/* Date navigation */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-primary-800">
            {format(selectedDate, 'EEEE, d MMMM yyyy', { locale })}
          </h2>
          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pending tasks */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-primary-800">
            {t('pending')} ({pendingTasks.length})
          </h2>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'pl' ? 'Brak zadań do wykonania' : 'No pending tasks'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks
              .sort((a, b) => a.endTime.localeCompare(b.endTime))
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                >
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className="w-8 h-8 rounded-full border-2 border-yellow-400 flex items-center justify-center hover:bg-yellow-100 transition-colors flex-shrink-0"
                  >
                    <Check className="w-4 h-4 text-yellow-400 opacity-0 hover:opacity-100" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-primary-800">{task.endTime}</span>
                      <span className="font-semibold text-primary-700">{task.horseName}</span>
                    </div>
                    <p className="text-gray-700">
                      {language === 'pl' ? 'Przygotować' : 'Prepare'}: {task.mealDescription}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Check className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-primary-800">
              {t('completed')} ({completedTasks.length})
            </h2>
          </div>

          <div className="space-y-3">
            {completedTasks
              .sort((a, b) => a.endTime.localeCompare(b.endTime))
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl opacity-75"
                >
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors flex-shrink-0"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-gray-600 line-through">
                        {task.endTime}
                      </span>
                      <span className="font-semibold text-gray-600 line-through">
                        {task.horseName}
                      </span>
                    </div>
                    <p className="text-gray-500 line-through">{task.mealDescription}</p>
                    {task.completedBy && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t('completedBy')}: {task.completedBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Feeding;
