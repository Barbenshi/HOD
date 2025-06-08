import { Box, Button, Typography, Paper, Alert, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './supabaseClient';

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

export default function StudentFlow() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; correctAnswer?: string } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const question = questions[step];

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase.from('questions').select('*').order('order', { ascending: true }).order('id');
      if (!error && data) setQuestions(data);
      setLoading(false);
    }
    fetchQuestions();
  }, []);

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
    // correct_answer_ids is an array of ids
    const correct =
      Array.isArray(question.correct_answer_ids) &&
      multiSelect.length === question.correct_answer_ids.length &&
      multiSelect.every((id) => question.correct_answer_ids.includes(id));
    setFeedback({ correct, explanation: question.explanation, correctAnswer: question.options?.filter((o: any) => question.correct_answer_ids.includes(o.id)).map((o: any) => o.text).join(', ') });
  };

  if (loading) return <div>Loading...</div>;
  if (!questions.length) return <div>No questions found.</div>;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>{t('caseQuestion')}</Typography>
      <Typography variant="body1" gutterBottom>{question.text || question["case"]}</Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        {(question.type === 'MULTIPLE_CHOICE' || question.type === 'WHAT_IS_NEXT') && question.options?.map((opt: any) => (
          <Button
            key={opt.id}
            variant={selected === opt.id ? 'contained' : 'outlined'}
            onClick={() => handleAnswer(opt.id)}
            fullWidth
            disabled={!!feedback}
          >
            {opt.text}
          </Button>
        ))}
        {(question.type === 'TRUE_FALSE' || question.type === 'YES_NO_EXPLAIN') && [
          { id: 'true', text: t('yes') },
          { id: 'false', text: t('no') },
        ].map((opt) => (
          <Button
            key={opt.id}
            variant={selected === opt.id ? 'contained' : 'outlined'}
            onClick={() => handleAnswer(opt.id)}
            fullWidth
            disabled={!!feedback}
          >
            {opt.text}
          </Button>
        ))}
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
            {question.options.map((opt: any) => (
              <FormControlLabel
                key={opt.id}
                control={
                  <Checkbox
                    checked={multiSelect.includes(opt.id)}
                    onChange={e => {
                      if (e.target.checked) setMultiSelect([...multiSelect, opt.id]);
                      else setMultiSelect(multiSelect.filter(id => id !== opt.id));
                    }}
                    disabled={!!feedback}
                  />
                }
                label={opt.text}
              />
            ))}
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
            setStep(step + 1);
            setSelected(null);
            setFeedback(null);
            setInputValue('');
            setMultiSelect([]);
          }}
        >{step < questions.length - 1 ? t('next') : t('finish')}</Button>
      </Box>
    </Paper>
  );
}
