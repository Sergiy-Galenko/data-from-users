import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface Question {
  text: string;
  options: string[];
}

interface UserSurveyResponse {
  surveyId: string;
  userId: string;
  userName: string;
  userPhone: string;
  answers: {
    questionIndex: number;
    answer: string;
  }[];
  completedAt: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  responses: UserSurveyResponse[];
}

const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: [{ text: '', options: [''] }],
  });
  const [newOption, setNewOption] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/surveys');
      if (!response.ok) {
        throw new Error('Помилка отримання даних');
      }
      const data = await response.json();
      setSurveys(data.surveys);
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewSurvey({
      title: '',
      description: '',
      questions: [{ text: '', options: [''] }],
    });
    setNewOption('');
  };

  const handleAddQuestion = () => {
    setNewSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', options: [''] }],
    }));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      text: value,
    };
    setNewSurvey(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleAddOption = (questionIndex: number) => {
    if (!newOption.trim()) return;
    
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: [...updatedQuestions[questionIndex].options, newOption.trim()],
    };
    
    setNewSurvey(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
    setNewOption('');
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);
    
    setNewSurvey(prev => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleCreateSurvey = async () => {
    try {
      // Перевіряємо дані перед відправкою
      console.log('Перевірка даних перед створенням:');
      console.log('Назва:', newSurvey.title);
      console.log('Опис:', newSurvey.description);
      console.log('Питання:', newSurvey.questions);
      
      // Перевіряємо валідність даних
      if (!newSurvey.title || !newSurvey.description) {
        console.error('Відсутня назва або опис');
        return;
      }
      
      if (!Array.isArray(newSurvey.questions) || newSurvey.questions.length === 0) {
        console.error('Немає питань');
        return;
      }
      
      for (const question of newSurvey.questions) {
        if (!question.text || !Array.isArray(question.options) || question.options.length === 0) {
          console.error('Некоректне питання:', question);
          return;
        }
      }

      console.log('Відправка даних на сервер:', JSON.stringify(newSurvey, null, 2));
      
      const response = await fetch('http://localhost:3001/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSurvey),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Помилка відповіді сервера:', errorData);
        throw new Error('Помилка створення опитування');
      }

      const createdSurvey = await response.json();
      console.log('Опитування успішно створено:', createdSurvey);

      await fetchSurveys();
      handleCloseDialog();
    } catch (error) {
      console.error('Помилка при створенні опитування:', error);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/surveys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Помилка видалення опитування');
      }

      await fetchSurveys();
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  const handleViewResponses = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowResponses(true);
  };

  const handleCloseResponses = () => {
    setShowResponses(false);
    setSelectedSurvey(null);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h1" variant="h4">
            Управління опитуваннями
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Створити опитування
          </Button>
        </Box>

        <List>
          {surveys.map((survey) => (
            <React.Fragment key={survey.id}>
              <ListItem>
                <ListItemText
                  primary={survey.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {survey.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Створено: {new Date(survey.createdAt).toLocaleDateString()}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Кількість відповідей: {survey.responses.length}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleViewResponses(survey)}
                    sx={{ mr: 1 }}
                  >
                    Відповіді
                  </Button>
                  <IconButton
                    edge="end"
                    aria-label="видалити"
                    onClick={() => handleDeleteSurvey(survey.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {surveys.length === 0 && (
            <ListItem>
              <ListItemText
                primary="Немає доступних опитувань"
                secondary="Створіть нове опитування, натиснувши кнопку вище"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Діалог створення опитування */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Створення нового опитування</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Назва опитування"
            value={newSurvey.title}
            onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Опис опитування"
            multiline
            rows={2}
            value={newSurvey.description}
            onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Питання
          </Typography>
          {newSurvey.questions.map((question, questionIndex) => (
            <Box key={questionIndex} sx={{ mb: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label={`Питання ${questionIndex + 1}`}
                value={question.text}
                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
              />
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Варіанти відповідей:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {question.options.map((option, optionIndex) => (
                  <Chip
                    key={optionIndex}
                    label={option}
                    onDelete={() => handleRemoveOption(questionIndex, optionIndex)}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  label="Новий варіант відповіді"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption(questionIndex);
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleAddOption(questionIndex)}
                  disabled={!newOption.trim()}
                >
                  Додати
                </Button>
              </Box>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{ mt: 2 }}
          >
            Додати питання
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button
            onClick={handleCreateSurvey}
            variant="contained"
            color="primary"
            disabled={
              !newSurvey.title ||
              !newSurvey.description ||
              newSurvey.questions.some(q => !q.text || q.options.length === 0)
            }
          >
            Створити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Діалог перегляду відповідей */}
      <Dialog
        open={showResponses}
        onClose={handleCloseResponses}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Відповіді на опитування: {selectedSurvey?.title}
        </DialogTitle>
        <DialogContent>
          {selectedSurvey?.responses.length === 0 ? (
            <Typography>Поки немає відповідей на це опитування</Typography>
          ) : (
            selectedSurvey?.responses.map((response, responseIndex) => (
              <Box key={responseIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Відповідь від {response.userName} ({response.userPhone})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Завершено: {new Date(response.completedAt).toLocaleString()}
                </Typography>
                {response.answers.map((answer, answerIndex) => (
                  <Box key={answerIndex} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Питання {answerIndex + 1}:</strong> {selectedSurvey.questions[answer.questionIndex].text}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Відповідь: {answer.answer}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 2 }} />
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponses}>Закрити</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Surveys; 