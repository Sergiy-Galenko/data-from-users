import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, IconButton, InputAdornment } from '@mui/material';
import { PatternFormat } from 'react-number-format';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import usersData from '../data/users.json';
import { User, UsersData } from '../types';

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
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Вхід
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <PatternFormat
              customInput={TextField}
              format="+38 (###) ### ## ##"
              mask="_"
              margin="normal"
              required
              fullWidth
              label="Номер телефону"
              value={phone}
              onValueChange={(values) => setPhone(values.value)}
              autoFocus
            />
            <TextField
              margin="normal"
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
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Увійти
            </Button>
            <Link to="/register">
              <Typography align="center" color="primary">
                Немає облікового запису? Зареєструватися
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 