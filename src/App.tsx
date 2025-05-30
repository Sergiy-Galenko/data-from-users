import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { lightTheme, darkTheme } from './theme';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import Surveys from './components/Surveys';
import UserSurveys from './components/UserSurveys';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/surveys" element={<Surveys />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/surveys" element={<UserSurveys />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          className="App"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'background-color 0.3s ease-in-out',
          }}
        >
          <a href="#main-content" className="skip-to-main">
            Перейти до основного контенту
          </a>
          <Box
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <ThemeToggle toggleTheme={toggleTheme} />
          </Box>
          <main id="main-content">
            <AnimatedRoutes />
          </main>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
