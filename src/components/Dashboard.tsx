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
import { Poll as PollIcon } from '@mui/icons-material';

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

  const handleSurveysClick = () => {
    navigate('/surveys');
  };

  if (!user) {
    return null;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h1" variant="h4">
            Особистий кабінет
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PollIcon />}
              onClick={handleSurveysClick}
              sx={{ mr: 2 }}
            >
              Опитування
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
            >
              Вийти
            </Button>
          </Box>
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
      </Paper>
    </Container>
  );
};

export default Dashboard; 