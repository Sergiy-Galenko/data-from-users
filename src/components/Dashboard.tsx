import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { User } from '../types';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Отримуємо дані користувача з localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Якщо немає даних користувача, перенаправляємо на сторінку входу
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Видаляємо дані користувача з localStorage
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Особистий кабінет
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Ласкаво просимо, {user.name}!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Особиста інформація
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Ім'я:</strong> {user.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Номер телефону:</strong> {user.phone}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Інформація про житло
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Номер квартири:</strong> {user.apartmentNumber}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Поверх:</strong> {user.floor}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
          >
            Вийти
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard; 