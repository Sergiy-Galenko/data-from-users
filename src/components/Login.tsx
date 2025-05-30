import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, IconButton, InputAdornment, useTheme } from '@mui/material';
import { PatternFormat } from 'react-number-format';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import usersData from '../data/users.json';
import { User, UsersData } from '../types';
import AnimatedPage from './AnimatedPage';

const typedUsersData = usersData as UsersData;

const normalizePhoneNumber = (phone: string): string => {
  // Видаляємо всі символи крім цифр
  const digits = phone.replace(/\D/g, '');
  // Якщо номер починається з +38, видаляємо цей префікс
  return digits.startsWith('38') ? digits.slice(2) : digits;
};

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const normalizedPhone = normalizePhoneNumber(phone);
    const normalizedAdminPhone = normalizePhoneNumber(typedUsersData.admin.phone);
    
    // Check admin credentials
    if (normalizedPhone === normalizedAdminPhone && password === typedUsersData.admin.password) {
      localStorage.setItem('currentUser', JSON.stringify({
        ...typedUsersData.admin,
        isAdmin: true
      }));
      navigate('/admin');
      return;
    }

    try {
      // Отримуємо всіх користувачів з API
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) {
        throw new Error('Помилка отримання даних');
      }
      const data = await response.json();
      
      // Шукаємо користувача з відповідним номером телефону та паролем
      const user = data.users.find(
        (u: User) => normalizePhoneNumber(u.phone) === normalizedPhone && u.password === password
      );

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('Невірний номер телефону або пароль');
      }
    } catch (err) {
      setError('Помилка входу в систему');
      console.error('Помилка:', err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AnimatedPage>
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            mt: { xs: 4, sm: 8 },
            borderRadius: 2,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                mb: 3,
              }}
            >
              Вхід
            </Typography>
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                mt: 1, 
                width: '100%',
                '& .MuiTextField-root': {
                  mb: 2,
                },
              }}
            >
              <PatternFormat
                customInput={TextField}
                format="+38 (###) ### ## ##"
                mask="_"
                required
                fullWidth
                label="Номер телефону"
                value={phone}
                onValueChange={(values) => setPhone(values.value)}
                autoFocus
                aria-label="Номер телефону"
                error={!!error}
                helperText={error && 'Перевірте правильність введення'}
              />
              <TextField
                required
                fullWidth
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!error}
                helperText={error && 'Перевірте правильність введення'}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                Увійти
              </Button>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography 
                  align="center" 
                  color="primary"
                  sx={{
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                      color: theme.palette.primary.dark,
                    },
                  }}
                >
                  Немає облікового запису? Зареєструватися
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </AnimatedPage>
  );
};

export default Login; 