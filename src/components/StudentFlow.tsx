import { Box, Button, Typography, Paper, Alert, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

function getCorrectText(question: any) {
  if (question.type === 'MULTIPLE_CHOICE' || question.type === 'WHAT_IS_NEXT') {
    return question.options?.find((o: any) => o.id === question.correct_answer_id)?.text || '';
  }
  if (question.type === 'TRUE_FALSE' || question.type === 'YES_NO_EXPLAIN') {
    return question.correct_answer === 'true' || question.correct_answer === true ? 'True' : 'False';
  }
  if (question.type === 'FILL_IN_THE_BLANK') {
    return question.correct_answer;
  }
  if (question.type === 'SHORT_ANSWER') {
    return question.model_answer;
  }
  if (question.type === 'RISK_FACTOR') {
    return (question.risk_factors_from_case || []).filter((rf: any) => (question.correct_risk_factor_ids || []).includes(rf.id)).map((rf: any) => rf.text).join(', ');
  }
  return '';
}

export default function StudentFlow({ caseId, onBack }: { caseId?: number; onBack?: () => void }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; correctAnswer?: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]); // Track answers
  const [showSummary, setShowSummary] = useState(false);
  const question = questions[step];

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      let query = supabase.from('questions').select('*').order('order', { ascending: true }).order('id');
      if (caseId) query = query.eq('case_id', caseId);
      const { data, error } = await query;
      if (!error && data) setQuestions(data);
      setLoading(false);
    }
    fetchQuestions();
  }, [caseId]);

  const handleAnswer = (optionId: string) => {
    if (!question) return;
    let correct = false;
    let correctAnswer = getCorrectText(question);
    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'WHAT_IS_NEXT') {
      correct = optionId === question.correct_answer_id;
    } else if (question.type === 'TRUE_FALSE' || question.type === 'YES_NO_EXPLAIN') {
      correct = optionId === String(question.correct_answer);
    }
    setSelected(optionId);
    setFeedback({ correct, explanation: question.explanation, correctAnswer });
  };

  const handleFillBlank = () => {
    if (!question) return;
    const correct = inputValue.trim() === question.correct_answer;
    setFeedback({ correct, explanation: question.explanation, correctAnswer: question.correct_answer });
  };

  const handleShortAnswer = () => {
    if (!question) return;
    setFeedback({ correct: true, explanation: question.explanation, correctAnswer: question.model_answer });
  };

  const handleRiskFactor = () => {
    if (!question) return;
    const correct =
      Array.isArray(question.correct_risk_factor_ids) &&
      multiSelect.length === question.correct_risk_factor_ids.length &&
      multiSelect.every((id) => question.correct_risk_factor_ids.includes(id));
    setFeedback({ correct, explanation: question.explanation, correctAnswer: getCorrectText(question) });
  };

  // MULTIPLE_SELECT support
  const handleMultiSelect = () => {
    if (!question) return;
    const correct =
      Array.isArray(question.correct_answer_ids) &&
      multiSelect.length === question.correct_answer_ids.length &&
      multiSelect.every((id) => question.correct_answer_ids.includes(id));
    setFeedback({ correct, explanation: question.explanation, correctAnswer: question.options?.filter((o: any) => question.correct_answer_ids.includes(o.id)).map((o: any) => o.text).join(', ') });
  };

  if (loading) return <div>Loading...</div>;
  if (!questions.length) return <div>No questions found.</div>;

  // Show summary page if finished
  if (showSummary) {
    const correctCount = answers.filter(a => a.correct).length;
    const total = answers.length;
    const incorrectCount = total - correctCount;
    let feedbackMsg = '';
    if (correctCount === total) feedbackMsg = t('summary_perfect');
    else if (correctCount > total / 2) feedbackMsg = t('summary_good');
    else feedbackMsg = t('summary_try_again');
    return (
      <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>{t('summary_title')}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{t('summary_stats', { correct: correctCount, total, incorrect: incorrectCount })}</Typography>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>{feedbackMsg}</Typography>
        <Button variant="contained" onClick={onBack}>{t('summary_back_to_cases')}</Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      {onBack && (
        <Button onClick={onBack} sx={{ mb: 2 }}>{t('back')}</Button>
      )}
      <Typography variant="h6" gutterBottom>{t('caseQuestion')}</Typography>
      <Typography variant="body1" gutterBottom>{question.text || question["case"]}</Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        {/* MULTIPLE_CHOICE & WHAT_IS_NEXT with custom UX */}
        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'WHAT_IS_NEXT') && question.options?.map((opt: any) => {
          const isSelected = selected === opt.id;
          const isCorrect = question.correct_answer_id === opt.id;
          const showFeedback = !!feedback;
          let base = 'w-full my-1 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left';
          let state = '';
          let icon = null;
          if (showFeedback) {
            if (isSelected && isCorrect) {
              state = 'bg-green-100 border-green-500 ring-2 ring-green-300';
              icon = <span className="text-green-600 text-xl">✔️</span>;
            } else if (isSelected && !isCorrect) {
              state = 'bg-red-100 border-red-500 ring-2 ring-red-300 animate-shake';
              icon = <span className="text-red-600 text-xl">❌</span>;
            } else if (!isSelected && isCorrect) {
              state = 'bg-green-50 border-green-300';
              icon = <span className="text-green-400 text-xl">✔️</span>;
            } else {
              state = 'bg-white border-gray-200';
            }
          } else if (isSelected) {
            state = 'bg-blue-100 border-blue-400 ring-2 ring-blue-200';
          } else {
            state = 'bg-white border-gray-200';
          }
          return (
            <div
              key={opt.id}
              className={`${base} ${state} ${showFeedback ? 'pointer-events-none' : ''}`}
              onClick={() => !showFeedback && handleAnswer(opt.id)}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              style={{ outline: 'none' }}
            >
              {icon}
              <span className="flex-1">{opt.text}</span>
            </div>
          );
        })}
        {/* TRUE_FALSE & YES_NO_EXPLAIN with custom UX */}
        {(question.type === 'TRUE_FALSE' || question.type === 'YES_NO_EXPLAIN') && [
          { id: 'true', text: t('yes') },
          { id: 'false', text: t('no') },
        ].map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = String(question.correct_answer) === opt.id;
          const showFeedback = !!feedback;
          let base = 'w-full my-1 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left';
          let state = '';
          let icon = null;
          if (showFeedback) {
            if (isSelected && isCorrect) {
              state = 'bg-green-100 border-green-500 ring-2 ring-green-300';
              icon = <span className="text-green-600 text-xl">✔️</span>;
            } else if (isSelected && !isCorrect) {
              state = 'bg-red-100 border-red-500 ring-2 ring-red-300 animate-shake';
              icon = <span className="text-red-600 text-xl">❌</span>;
            } else if (!isSelected && isCorrect) {
              state = 'bg-green-50 border-green-300';
              icon = <span className="text-green-400 text-xl">✔️</span>;
            } else {
              state = 'bg-white border-gray-200';
            }
          } else if (isSelected) {
            state = 'bg-blue-100 border-blue-400 ring-2 ring-blue-200';
          } else {
            state = 'bg-white border-gray-200';
          }
          return (
            <div
              key={opt.id}
              className={`${base} ${state} ${showFeedback ? 'pointer-events-none' : ''}`}
              onClick={() => !showFeedback && handleAnswer(opt.id)}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              style={{ outline: 'none' }}
            >
              {icon}
              <span className="flex-1">{opt.text}</span>
            </div>
          );
        })}
        {question.type === 'FILL_IN_THE_BLANK' && (
          <Box display="flex" gap={2}>
            <TextField
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              label={t('yourAnswer')}
              disabled={!!feedback}
              fullWidth
            />
            <Button variant="contained" onClick={handleFillBlank} disabled={!!feedback || !inputValue}>{t('submit')}</Button>
          </Box>
        )}
        {question.type === 'SHORT_ANSWER' && (
          <Box display="flex" gap={2}>
            <TextField
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              label={t('yourAnswer')}
              disabled={!!feedback}
              fullWidth
            />
            <Button variant="contained" onClick={handleShortAnswer} disabled={!!feedback || !inputValue}>{t('showExplanation')}</Button>
          </Box>
        )}
        {question.type === 'RISK_FACTOR' && question.risk_factors_from_case && (
          <>
            {question.risk_factors_from_case.map((rf: any) => (
              <FormControlLabel
                key={rf.id}
                control={
                  <Checkbox
                    checked={multiSelect.includes(rf.id)}
                    onChange={e => {
                      if (e.target.checked) setMultiSelect([...multiSelect, rf.id]);
                      else setMultiSelect(multiSelect.filter(id => id !== rf.id));
                    }}
                    disabled={!!feedback}
                  />
                }
                label={rf.text}
              />
            ))}
            <Button variant="contained" onClick={handleRiskFactor} disabled={!!multiSelect.length || !!feedback}>{t('submit')}</Button>
          </>
        )}
        {/* MULTIPLE_SELECT */}
        {question.type === 'MULTIPLE_SELECT' && question.options && (
          <>
            {question.options.map((opt: any) => {
              const isChecked = multiSelect.includes(opt.id);
              const isCorrect = feedback && Array.isArray(question.correct_answer_ids) && question.correct_answer_ids.includes(opt.id);
              const showFeedback = !!feedback;
              let base = 'w-full my-1 flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left';
              let state = '';
              let icon = null;
              if (showFeedback) {
                if (isChecked && isCorrect) {
                  state = 'bg-green-100 border-green-500 ring-2 ring-green-300';
                  icon = <span className="text-green-600 text-xl">✔️</span>;
                } else if (isChecked && !isCorrect) {
                  state = 'bg-red-100 border-red-500 ring-2 ring-red-300 animate-shake';
                  icon = <span className="text-red-600 text-xl">❌</span>;
                } else if (!isChecked && isCorrect) {
                  state = 'bg-green-50 border-green-300';
                  icon = <span className="text-green-400 text-xl">✔️</span>;
                } else {
                  state = 'bg-white border-gray-200';
                }
              } else if (isChecked) {
                state = 'bg-blue-100 border-blue-400 ring-2 ring-blue-200';
              } else {
                state = 'bg-white border-gray-200';
              }
              return (
                <div
                  key={opt.id}
                  className={`${base} ${state} ${showFeedback ? 'pointer-events-none' : ''}`}
                  onClick={() => {
                    if (showFeedback) return;
                    if (isChecked) setMultiSelect(multiSelect.filter(id => id !== opt.id));
                    else setMultiSelect([...multiSelect, opt.id]);
                  }}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={isChecked}
                  style={{ outline: 'none' }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="accent-blue-600 w-5 h-5 mr-2"
                    tabIndex={-1}
                  />
                  {icon}
                  <span className="flex-1">{opt.text}</span>
                </div>
              );
            })}
            <Button variant="contained" onClick={handleMultiSelect} disabled={!!feedback || !multiSelect.length}>{t('submit')}</Button>
          </>
        )}
      </Box>
      {feedback && (
        <Alert severity={feedback.correct ? 'success' : 'error'} sx={{ mt: 2 }}>
          {feedback.correct ? t('correct') : t('incorrect')}<br />
          {feedback.explanation}
          {!feedback.correct && feedback.correctAnswer && (
            <><br />{t('correctAnswer')}: {feedback.correctAnswer}</>
          )}
        </Alert>
      )}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          disabled={step === 0}
          onClick={() => { setStep(step - 1); setSelected(null); setFeedback(null); setInputValue(''); setMultiSelect([]); }}
        >{t('back')}</Button>
        <Button
          disabled={!feedback}
          onClick={() => {
            // Save answer correctness
            setAnswers(prev => {
              const updated = [...prev];
              updated[step] = { correct: Boolean(feedback?.correct) };
              return updated;
            });
            if (step < questions.length - 1) {
              setStep(step + 1);
              setSelected(null);
              setFeedback(null);
              setInputValue('');
              setMultiSelect([]);
            } else {
              // Finished all questions
              setShowSummary(true);
            }
          }}
        >{step < questions.length - 1 ? t('next') : t('finish')}</Button>
      </Box>
    </Paper>
  );
}
