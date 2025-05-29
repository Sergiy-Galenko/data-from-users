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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { User } from '../types';
import { Poll as PollIcon, Lightbulb as LightbulbIcon, Circle } from '@mui/icons-material';
import SuggestionForm from './SuggestionForm';
import { SuggestionPriority, Suggestion } from '../types/Suggestion';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Отримуємо дані користувача з localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('Дані користувача після логіну:', parsedUser);
      setUser(parsedUser);
      // Завантажуємо пропозиції користувача після встановлення користувача
      if (parsedUser?.id) {
        fetchUserSuggestions(parsedUser.id);
      }
    } else {
      // Якщо немає даних користувача, перенаправляємо на сторінку входу
      navigate('/login');
    }
  }, [navigate]);

  // Функція для завантаження пропозицій користувача
  const fetchUserSuggestions = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/suggestions?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setUserSuggestions(data.suggestions || []);
      } else {
        console.error('Помилка завантаження пропозицій:', data.error);
      }
    } catch (error) {
      console.error('Помилка мережі при завантаженні пропозицій:', error);
    }
  };

  const handleLogout = () => {
    // Видаляємо дані користувача з localStorage
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleSurveysClick = () => {
    navigate('/surveys');
  };

  const handleSuggestionSubmit = async (content: string, priority: SuggestionPriority) => {
    if (!user) {
      alert('Помилка: користувач не авторизований');
      return;
    }

    // Додаткова перевірка перед використанням user.id
    if (!user.id) {
        console.error('Помилка: userId відсутній в об\'єкті користувача', user);
        alert('Помилка: неможливо відправити пропозицію без ID користувача.');
        return;
    }

    console.log('Відправка пропозиції:', {
      content,
      priority,
      userId: user.id
    });

    try {
      const response = await fetch('http://localhost:3001/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          priority,
          userId: user.id,
        }),
      });

      const data = await response.json();
      console.log('Відповідь сервера:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Помилка відправки пропозиції');
      }

      alert('Пропозицію успішно відправлено');
      // Оновлюємо список пропозицій після успішної відправки
      fetchUserSuggestions(user.id);
    } catch (error) {
      console.error('Помилка:', error);
      alert(error instanceof Error ? error.message : 'Помилка при відправці пропозиції');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Якщо переходимо на вкладку Пропозиції, завантажуємо їх
    if (newValue === 1 && user?.id) {
      fetchUserSuggestions(user.id);
    }
  };

  // Функція для отримання кольору статусу
  const getStatusColor = (status: Suggestion['status']) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'in_progress':
        return 'blue';
      case 'resolved':
        return 'green';
      default:
        return 'black';
    }
  };

  // Функція для отримання української назви статусу
  const getStatusLabel = (status: Suggestion['status']) => {
    switch (status) {
      case 'pending':
        return 'В очікуванні';
      case 'in_progress':
        return 'В роботі';
      case 'resolved':
        return 'Вирішено';
      default:
        return status;
    }
  };

  // Функція для отримання української назви пріоритету
  const getPriorityLabel = (priority: SuggestionPriority) => {
    switch (priority) {
      case 'urgent':
        return 'Терміново';
      case 'less_important':
        return 'Менш важливе';
      case 'very_important':
        return 'Дуже важливе';
      default:
        return priority;
    }
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

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Особиста інформація" />
            <Tab label="Пропозиції" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
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
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Мої пропозиції</Typography>
            <SuggestionForm onSubmit={handleSuggestionSubmit} />
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Список моїх пропозицій</Typography>
              <List>
                {userSuggestions.length > 0 ? (
                  userSuggestions.map((suggestion) => (
                    <ListItem key={suggestion.id}>
                      <ListItemIcon>
                         <Circle sx={{ color: getStatusColor(suggestion.status), fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.content}
                        secondary={
                          <>Статус: {getStatusLabel(suggestion.status)} | Пріоритет: {getPriorityLabel(suggestion.priority)}</>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography>У вас ще немає пропозицій.</Typography>
                )}
              </List>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard; 