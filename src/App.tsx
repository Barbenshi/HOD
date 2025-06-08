import { CssBaseline, ThemeProvider, createTheme, AppBar, Tabs, Tab, Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css'
import StudentFlow from './StudentFlow';
import AdminPanel from './AdminPanel';

function App() {
  const { i18n: i18nextInstance } = useTranslation();
  const direction = i18nextInstance.language === 'he' ? 'rtl' : 'ltr';
  const [tab, setTab] = useState(0);

  useEffect(() => {
    document.body.dir = direction;
  }, [direction]);

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
          {tab === 0 && <StudentFlow />}
          {tab === 1 && <AdminPanel />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App
