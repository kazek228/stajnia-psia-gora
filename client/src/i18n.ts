import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pl: {
    translation: {
      // General
      appName: 'Stajnia Wolnowybiegowa na Psiej Górze',
      appNameShort: 'Stajnia Psia Góra',
      welcome: 'Witamy',
      loading: 'Ładowanie...',
      save: 'Zapisz',
      cancel: 'Anuluj',
      delete: 'Usuń',
      edit: 'Edytuj',
      add: 'Dodaj',
      search: 'Szukaj',
      actions: 'Akcje',
      confirm: 'Potwierdź',
      yes: 'Tak',
      no: 'Nie',
      
      // Auth
      login: 'Zaloguj się',
      logout: 'Wyloguj',
      email: 'Email',
      password: 'Hasło',
      loginError: 'Nieprawidłowy email lub hasło',
      loginTitle: 'Zaloguj się do systemu',
      
      // Navigation
      dashboard: 'Panel główny',
      horses: 'Konie',
      riders: 'Jeźdźcy',
      trainers: 'Trenerzy',
      schedule: 'Harmonogram',
      feeding: 'Karmienie',
      statistics: 'Statystyki',
      settings: 'Ustawienia',
      mySchedule: 'Mój grafik',
      
      // Roles
      admin: 'Administrator',
      rider: 'Jeździec',
      trainer: 'Trener',
      stableHand: 'Stajenny',
      
      // Horses
      horseName: 'Imię konia',
      riderName: 'Imię jeźdźca',
      breed: 'Rasa',
      level: 'Poziom',
      maxWorkHours: 'Maks. godzin pracy',
      restAfterWork: 'Przerwa po pracy (h)',
      postTrainingMeal: 'Posiłek po treningu',
      notes: 'Notatki',
      addHorse: 'Dodaj konia',
      editHorse: 'Edytuj konia',
      horseDetails: 'Szczegóły konia',
      workload: 'Obciążenie',
      
      // Levels
      beginner: 'Początkujący',
      intermediate: 'Średniozaawansowany',
      advanced: 'Zaawansowany',
      
      // Schedule
      date: 'Data',
      time: 'Godzina',
      startTime: 'Godzina rozpoczęcia',
      endTime: 'Godzina zakończenia',
      duration: 'Czas trwania (min)',
      sundayPlanner: 'Planer tygodniowy',
      addSession: 'Dodaj sesję',
      editSession: 'Edytuj sesję',
      noSchedules: 'Brak zaplanowanych jazd',
      
      // Welfare
      welfareWarning: 'Ostrzeżenie dobrostanu',
      levelMismatch: 'Niezgodność poziomów',
      workLimitExceeded: 'Przekroczony limit pracy',
      breakRequired: 'Wymagana przerwa',
      
      // Feeding
      feedingList: 'Lista karmienia',
      horseToPrepare: 'Koń do przygotowania',
      mealDescription: 'Opis posiłku',
      markAsDone: 'Oznacz jako wykonane',
      completed: 'Wykonane',
      pending: 'Do wykonania',
      completedBy: 'Wykonane przez',
      
      // Rider Portal
      yourRide: 'Twoja jazda',
      upcomingRides: 'Nadchodzące jazdy',
      noUpcomingRides: 'Brak nadchodzących jazd',
      rideInfo: 'Twoja jazda jest o {{time}} na koniu {{horse}}',
      withTrainer: 'z trenerem {{trainer}}',
      
      // Dashboard
      todaySchedules: 'Dzisiejsze jazdy',
      horseWorkloads: 'Obciążenie koni',
      stats: 'Statystyki',
      totalHorses: 'Konie',
      totalRiders: 'Jeźdźcy',
      totalTrainers: 'Trenerzy',
      
      // Statistics
      workStatistics: 'Statystyki pracy',
      dailyStats: 'Statystyki dzienne',
      monthlyStats: 'Statystyki miesięczne',
      allTimeStats: 'Statystyki całościowe',
      selectDate: 'Wybierz datę',
      selectMonth: 'Wybierz miesiąc',
      trainerWorkload: 'Obciążenie trenerów',
      horseWorkload2: 'Obciążenie koni',
      sessions: 'Sesje',
      totalHours: 'Łącznie godzin',
      noDataForPeriod: 'Brak danych dla wybranego okresu',
      
      // Errors
      error: 'Błąd',
      serverError: 'Błąd serwera',
      notFound: 'Nie znaleziono',
      unauthorized: 'Brak autoryzacji',
      
      // Success
      success: 'Sukces',
      savedSuccessfully: 'Zapisano pomyślnie',
      deletedSuccessfully: 'Usunięto pomyślnie',
    },
  },
  en: {
    translation: {
      // General
      appName: 'Free-Range Stable at Psia Góra',
      appNameShort: 'Psia Góra Stable',
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      actions: 'Actions',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      
      // Auth
      login: 'Log in',
      logout: 'Log out',
      email: 'Email',
      password: 'Password',
      loginError: 'Invalid email or password',
      loginTitle: 'Log in to the system',
      
      // Navigation
      dashboard: 'Dashboard',
      horses: 'Horses',
      riders: 'Riders',
      trainers: 'Trainers',
      schedule: 'Schedule',
      feeding: 'Feeding',
      statistics: 'Statistics',
      settings: 'Settings',
      mySchedule: 'My Schedule',
      
      // Roles
      admin: 'Administrator',
      rider: 'Rider',
      trainer: 'Trainer',
      stableHand: 'Stable Hand',
      
      // Horses
      horseName: 'Horse name',
      riderName: 'Rider name',
      breed: 'Breed',
      level: 'Level',
      maxWorkHours: 'Max work hours',
      restAfterWork: 'Rest after work (h)',
      postTrainingMeal: 'Post-training meal',
      notes: 'Notes',
      addHorse: 'Add horse',
      editHorse: 'Edit horse',
      horseDetails: 'Horse details',
      workload: 'Workload',
      
      // Levels
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      
      // Schedule
      date: 'Date',
      time: 'Time',
      startTime: 'Start time',
      endTime: 'End time',
      duration: 'Duration (min)',
      sundayPlanner: 'Sunday Planner',
      addSession: 'Add session',
      editSession: 'Edit session',
      noSchedules: 'No scheduled rides',
      
      // Welfare
      welfareWarning: 'Welfare warning',
      levelMismatch: 'Level mismatch',
      workLimitExceeded: 'Work limit exceeded',
      breakRequired: 'Break required',
      
      // Feeding
      feedingList: 'Feeding List',
      horseToPrepare: 'Horse to prepare',
      mealDescription: 'Meal description',
      markAsDone: 'Mark as done',
      completed: 'Completed',
      pending: 'Pending',
      completedBy: 'Completed by',
      
      // Rider Portal
      yourRide: 'Your Ride',
      upcomingRides: 'Upcoming Rides',
      noUpcomingRides: 'No upcoming rides',
      rideInfo: 'Your ride is at {{time}} on horse {{horse}}',
      withTrainer: 'with trainer {{trainer}}',
      
      // Dashboard
      todaySchedules: "Today's rides",
      horseWorkloads: 'Horse workloads',
      stats: 'Statistics',
      totalHorses: 'Horses',
      totalRiders: 'Riders',
      totalTrainers: 'Trainers',
      
      // Statistics
      workStatistics: 'Work Statistics',
      dailyStats: 'Daily Statistics',
      monthlyStats: 'Monthly Statistics',
      allTimeStats: 'All-Time Statistics',
      selectDate: 'Select Date',
      selectMonth: 'Select Month',
      trainerWorkload: 'Trainer Workload',
      horseWorkload2: 'Horse Workload',
      sessions: 'Sessions',
      totalHours: 'Total Hours',
      noDataForPeriod: 'No data for selected period',
      
      // Errors
      error: 'Error',
      serverError: 'Server error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      
      // Success
      success: 'Success',
      savedSuccessfully: 'Saved successfully',
      deletedSuccessfully: 'Deleted successfully',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'pl',
    fallbackLng: 'pl',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
