import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to the Medical Student Training App',
      studentTab: 'Student',
      adminTab: 'Admin',
      studentFlow: 'Student question flow will appear here',
      adminPanel: 'Admin panel will appear here',
      caseQuestion: 'Case Question',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      finished: 'You have completed all questions!',
      adminPanelTitle: 'Manage Questions/Cases',
      addQuestion: 'Add Question',
      case: 'Case',
      options: 'Options',
      actions: 'Actions',
      // Add more English translations here
    },
  },
  he: {
    translation: {
      welcome: 'ברוכים הבאים לאפליקציית תרגול לסטודנטים לרפואה',
      studentTab: 'סטודנט',
      adminTab: 'מנהל',
      studentFlow: 'כאן יוצגו שאלות הסטודנט',
      adminPanel: 'כאן יופיע פאנל הניהול',
      caseQuestion: 'שאלת מקרה',
      back: 'חזור',
      next: 'הבא',
      finish: 'סיים',
      finished: 'סיימת את כל השאלות!',
      adminPanelTitle: 'ניהול שאלות/מקרים',
      addQuestion: 'הוסף שאלה',
      case: 'מקרה',
      options: 'אפשרויות',
      actions: 'פעולות',
      // Add more Hebrew translations here
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
