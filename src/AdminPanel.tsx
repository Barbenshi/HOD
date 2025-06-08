import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, MenuItem, Radio, Checkbox, FormControlLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from './supabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'MULTIPLE_SELECT', label: 'Multiple Select' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'FILL_IN_THE_BLANK', label: 'Fill in the Blank' },
];

function QuestionDialog({ open, onClose, onSave, initial }: any) {
  const [type, setType] = useState(initial?.type || 'MULTIPLE_CHOICE');
  const [text, setText] = useState(initial?.text || '');
  const [options, setOptions] = useState(initial?.options ? (Array.isArray(initial.options) ? initial.options : (typeof initial.options === 'string' ? JSON.parse(initial.options) : [])) : [{ id: 'a', text: '' }]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>(
    initial?.correct_answer_id ? [initial.correct_answer_id] :
    initial?.correct_answer_ids ? initial.correct_answer_ids :
    initial?.correct_answer ? [initial.correct_answer] : []
  );
  const [modelAnswer, setModelAnswer] = useState(initial?.model_answer || '');
  const [explanation, setExplanation] = useState(initial?.explanation || '');

  useEffect(() => {
    setType(initial?.type || 'MULTIPLE_CHOICE');
    setText(initial?.text || '');
    setOptions(initial?.options ? (Array.isArray(initial.options) ? initial.options : (typeof initial.options === 'string' ? JSON.parse(initial.options) : [])) : [{ id: 'a', text: '' }]);
    setCorrectAnswers(
      initial?.correct_answer_id ? [initial.correct_answer_id] :
      initial?.correct_answer_ids ? initial.correct_answer_ids :
      initial?.correct_answer ? [initial.correct_answer] : []
    );
    setModelAnswer(initial?.model_answer || '');
    setExplanation(initial?.explanation || '');
  }, [initial, open]);

  // Option management
  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options];
    newOptions[idx].text = value;
    setOptions(newOptions);
  };
  const handleAddOption = () => {
    setOptions([...options, { id: String.fromCharCode(97 + options.length), text: '' }]);
  };
  const handleRemoveOption = (toRemoveIdx: number) => {
    const newOptions = options.filter((_opt: any, i: number) => i !== toRemoveIdx);
    setOptions(newOptions);
    setCorrectAnswers(correctAnswers.filter(id => id !== options[toRemoveIdx].id));
  };

  // Correct answer selection
  const handleCorrectChange = (id: string, checked: boolean) => {
    if (type === 'MULTIPLE_CHOICE') {
      setCorrectAnswers([id]);
    } else if (type === 'MULTIPLE_SELECT') {
      setCorrectAnswers(checked ? [...correctAnswers, id] : correctAnswers.filter(ans => ans !== id));
    }
  };

  const handleSave = () => {
    let q: any = { type, text, explanation };
    if (type === 'MULTIPLE_CHOICE') {
      q.options = options;
      q.correct_answer_id = correctAnswers[0];
    } else if (type === 'MULTIPLE_SELECT') {
      q.options = options;
      q.correct_answer_ids = correctAnswers;
    } else if (type === 'TRUE_FALSE') {
      q.correct_answer = correctAnswers[0];
    } else if (type === 'SHORT_ANSWER' || type === 'FILL_IN_THE_BLANK') {
      q.model_answer = modelAnswer;
    }
    onSave(q);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{initial ? 'Edit' : 'Add'} Question</DialogTitle>
      <DialogContent>
        <TextField select label="Type" value={type} onChange={e => setType(e.target.value)} fullWidth margin="normal">
          {QUESTION_TYPES.map(qt => <MenuItem key={qt.value} value={qt.value}>{qt.label}</MenuItem>)}
        </TextField>
        <TextField label="Question Text" value={text} onChange={e => setText(e.target.value)} fullWidth margin="normal" multiline />
        {(type === 'MULTIPLE_CHOICE' || type === 'MULTIPLE_SELECT') && (
          <Box>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Options</Typography>
            {options.map((opt: any, idx: number) => (
              <Box key={opt.id} display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  value={opt.text}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  label={`Option ${String.fromCharCode(65 + idx)}`}
                  size="small"
                  sx={{ flex: 1 }}
                />
                {type === 'MULTIPLE_CHOICE' ? (
                  <Radio
                    checked={correctAnswers[0] === opt.id}
                    onChange={() => handleCorrectChange(opt.id, true)}
                  />
                ) : (
                  <Checkbox
                    checked={correctAnswers.includes(opt.id)}
                    onChange={e => handleCorrectChange(opt.id, e.target.checked)}
                  />
                )}
                <IconButton onClick={() => handleRemoveOption(idx)} disabled={options.length <= 2} size="small"><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            ))}
            <Button onClick={handleAddOption} size="small" sx={{ mt: 1 }}>Add Option</Button>
          </Box>
        )}
        {type === 'TRUE_FALSE' && (
          <Box display="flex" gap={2} mt={2}>
            <FormControlLabel
              control={<Radio checked={correctAnswers[0] === 'true'} onChange={() => setCorrectAnswers(['true'])} />}
              label="True"
            />
            <FormControlLabel
              control={<Radio checked={correctAnswers[0] === 'false'} onChange={() => setCorrectAnswers(['false'])} />}
              label="False"
            />
          </Box>
        )}
        {(type === 'SHORT_ANSWER' || type === 'FILL_IN_THE_BLANK') && (
          <TextField label="Model Answer" value={modelAnswer} onChange={e => setModelAnswer(e.target.value)} fullWidth margin="normal" multiline />
        )}
        <TextField label="Explanation" value={explanation} onChange={e => setExplanation(e.target.value)} fullWidth margin="normal" multiline />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function AdminAuth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else alert('Check your email for the login link!');
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6, p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }}>
      <form onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Send Magic Link'}
        </Button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </Box>
  );
}

// Define the new question structure
export type QuestionOption = { id: string; text: string };
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'FILL_IN_THE_BLANK'
  | 'WHAT_IS_NEXT'
  | 'SHORT_ANSWER'
  | 'RISK_FACTOR'
  | 'YES_NO_EXPLAIN';
export type Question = {
  id: string;
  casePart: number;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  correctAnswerId?: string;
  correctAnswer?: string | boolean;
  modelAnswer?: string;
  riskFactorsFromCase?: QuestionOption[];
  correctRiskFactorIds?: string[];
  explanation: string;
};

export default function AdminPanel() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editQ, setEditQ] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase.from('questions').select('*').order('order', { ascending: true }).order('id');
      if (!error && data) setQuestions(data);
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthChecked(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setAuthChecked(true);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const handleAdd = () => { setEditQ(null); setDialogOpen(true); };
  const handleEdit = (q: any) => { setEditQ(q); setDialogOpen(true); };

  const handleSave = async (q: any) => {
    setDialogOpen(false);
    if (editQ) {
      await supabase.from('questions').update(q).eq('id', editQ.id);
    } else {
      // Ensure all required fields for MULTIPLE_SELECT
      if (q.type === 'MULTIPLE_SELECT') {
        // Ensure options is an array of objects with id/text
        if (!Array.isArray(q.options)) q.options = [];
        // Ensure correct_answer_ids is an array of strings
        if (!Array.isArray(q.correct_answer_ids)) q.correct_answer_ids = [];
        // Remove empty options and ensure ids are unique
        q.options = q.options.filter((o: any) => o.text && o.id);
        q.correct_answer_ids = q.correct_answer_ids.filter((id: string) => q.options.some((o: any) => o.id === id));
      }
      // For all types, remove empty options if present
      if (q.options && Array.isArray(q.options)) {
        q.options = q.options.filter((o: any) => o.text && o.id);
      }
      await supabase.from('questions').insert([
        {
          ...q,
          case_part: 0,
        },
      ]);
    }
    const { data } = await supabase.from('questions').select('*').order('order', { ascending: true }).order('id');
    setQuestions(data || []);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('questions').delete().eq('id', id);
    const { data } = await supabase.from('questions').select('*').order('id');
    setQuestions(data || []);
  };

  // Drag and drop handler
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setQuestions(reordered);
    // Persist new order in Supabase (add 'order' field to schema if not present)
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('questions').update({ order: i }).eq('id', reordered[i].id);
    }
  };

  if (!authChecked) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;
  if (!user || user.email !== 'barbenshimol2@gmail.com') return <AdminAuth />;

  if (loading) return <div>Loading...</div>;

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>{t('adminPanelTitle')}</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={handleAdd}>{t('addQuestion')}</Button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions-droppable">
          {(provided) => (
            <TableContainer ref={provided.innerRef} {...provided.droppableProps}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('case')}</TableCell>
                    <TableCell>{t('type')}</TableCell>
                    <TableCell>{t('options')}</TableCell>
                    <TableCell>{t('correctAnswer')}</TableCell>
                    <TableCell>{t('actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((q, idx) => (
                    <Draggable key={q.id} draggableId={q.id} index={idx}>
                      {(provided) => (
                        <TableRow ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TableCell>{q.text || q["case"]}</TableCell>
                          <TableCell>{q.type || '-'}</TableCell>
                          <TableCell>{q.options ? (Array.isArray(q.options) ? q.options.map((o: any) => o.text).join(', ') : (typeof q.options === 'string' ? JSON.parse(q.options).map((o: any) => o.text).join(', ') : '-')) : '-'}</TableCell>
                          <TableCell>{
                            q.correct_answer_id ? (q.options ? (Array.isArray(q.options) ? (q.options.find((o: any) => o.id === q.correct_answer_id)?.text || '-') : (typeof q.options === 'string' ? (JSON.parse(q.options).find((o: any) => o.id === q.correct_answer_id)?.text || '-') : '-')) : '-')
                            : q.correct_answer ? q.correct_answer : q.model_answer ? q.model_answer : q.correct_risk_factor_ids ? q.correct_risk_factor_ids.join(', ') : '-'
                          }</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEdit(q)}><EditIcon /></IconButton>
                            <IconButton color="error" onClick={() => handleDelete(q.id)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Droppable>
      </DragDropContext>
      <QuestionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} initial={editQ} />
    </Paper>
  );
}
