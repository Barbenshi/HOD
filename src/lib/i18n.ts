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
      summary_title: 'Summary',
      summary_stats: 'You answered {{correct}} out of {{total}} questions correctly ({{incorrect}} incorrect).',
      summary_perfect: 'Amazing! You got everything right! 🎉',
      summary_good: 'Great job! Keep practicing to improve even more! 😊',
      summary_try_again: 'Don\'t worry, try again and you\'ll get better! 💪',
      summary_back_to_cases: 'Back to Cases',
      correct: 'Correct!',
      incorrect: 'Incorrect.',
      correctAnswer: 'Correct answer',
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
      summary_title: 'סיכום',
      summary_stats: 'ענית נכון על {{correct}} מתוך {{total}} שאלות ({{incorrect}} לא נכונות).',
      summary_perfect: 'מעולה! ענית נכון על הכל! 🎉',
      summary_good: 'עבודה טובה! המשך לתרגל ולהשתפר! 😊',
      summary_try_again: 'לא נורא, נסה שוב ותשתפר! 💪',
      summary_back_to_cases: 'חזרה למקרים',
      correct: 'נכון!',
      incorrect: 'לא נכון.',
      correctAnswer: 'תשובה נכונה',
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
