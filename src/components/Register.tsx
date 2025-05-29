import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, IconButton, InputAdornment } from '@mui/material';
import { PatternFormat } from 'react-number-format';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { User } from '../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          password,
          apartmentNumber,
          floor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка реєстрації');
      }

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка реєстрації');
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
            Реєстрація
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
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
            <TextField
              margin="normal"
              required
              fullWidth
              label="Номер квартири"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Поверх"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
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
              Зареєструватися
            </Button>
            <Link to="/login">
              <Typography align="center" color="primary">
                Вже маєте обліковий запис? Увійти
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 