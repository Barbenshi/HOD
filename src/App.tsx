import { CssBaseline, ThemeProvider, createTheme, AppBar, Tabs, Tab, Box, Container, Card, CardContent, CardActionArea, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/index.css';
import './styles/App.css';
import AdminPanel from './components/AdminPanel';
import StudentFlow from './components/StudentFlow';
import './lib/i18n';
import { supabase } from './lib/supabaseClient';

function CaseSelection({ cases, onSelect }: { cases: any[]; onSelect: (caseId: number) => void }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
        {cases.map((c) => (
          <Box key={c.id} sx={{ flex: '1 1 300px', maxWidth: 350, minWidth: 250 }}>
            <Card>
              <CardActionArea onClick={() => onSelect(c.id)}>
                <CardContent>
                  <Typography variant="h6">{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.description}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function App() {
  const { i18n: i18nextInstance } = useTranslation();
  const direction = i18nextInstance.language === 'he' ? 'rtl' : 'ltr';
  const [tab, setTab] = useState(0);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  useEffect(() => {
    // Fetch cases from Supabase (assuming a 'cases' table with id, title, description)
    async function fetchCases() {
      const { data } = await supabase.from('cases').select('*').order('id');
      setCases(data || []);
    }
    fetchCases();
  }, []);

  const theme = createTheme({
    direction,
    typography: {
      fontFamily: direction === 'rtl' ? '"Noto Sans Hebrew", Arial' : 'Roboto, Arial',
    },
    palette: {
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#f5f6fa',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={2} sx={{ mb: 4 }}>
        <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="standard"
            sx={{ flex: 1 }}
          >
            <Tab label={i18nextInstance.t('studentTab')} />
            <Tab label={i18nextInstance.t('adminTab')} />
          </Tabs>
          <button
            onClick={() => i18nextInstance.changeLanguage(i18nextInstance.language === 'he' ? 'en' : 'he')}
            style={{
              marginLeft: 24,
              padding: '6px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#1976d2',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            {i18nextInstance.language === 'he' ? 'English' : 'עברית'}
          </button>
        </Container>
      </AppBar>
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '70vh' }}>
        <Box width="100%">
          {tab === 0 && (
            selectedCase == null ? (
              <CaseSelection cases={cases} onSelect={setSelectedCase} />
            ) : (
              <StudentFlow caseId={selectedCase} onBack={() => setSelectedCase(null)} />
            )
          )}
          {tab === 1 && <AdminPanel />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App
