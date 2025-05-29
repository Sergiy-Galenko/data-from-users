import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
} from '@mui/material';

interface Question {
  text: string;
  options: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  responses: any[];
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

const UserSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Перевіряємо, чи користувач авторизований
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchSurveys();
  }, [navigate]);

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

  const handleStartSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setAnswers(new Array(survey.questions.length).fill(''));
    setOpenDialog(true);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmitSurvey = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const response: UserSurveyResponse = {
        surveyId: selectedSurvey!.id,
        userId: currentUser.phone,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        answers: selectedSurvey!.questions.map((_, index) => ({
          questionIndex: index,
          answer: answers[index]
        })),
        completedAt: new Date().toISOString()
      };

      const apiResponse = await fetch(`http://localhost:3001/api/surveys/${selectedSurvey!.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });

      if (!apiResponse.ok) {
        throw new Error('Помилка відправки відповідей');
      }

      setSuccessMessage('Опитування успішно завершено!');
      setOpenDialog(false);
      setSelectedSurvey(null);
      setAnswers([]);

      // Очищаємо повідомлення через 3 секунди
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSurvey(null);
    setAnswers([]);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Доступні опитування
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

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
                        Кількість питань: {survey.questions.length}
                      </Typography>
                    </>
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleStartSurvey(survey)}
                >
                  Пройти опитування
                </Button>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {surveys.length === 0 && (
            <ListItem>
              <ListItemText
                primary="Немає доступних опитувань"
                secondary="Зачекайте, поки адміністратор створить опитування"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Діалог проходження опитування */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSurvey?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedSurvey?.description}
          </Typography>
          {selectedSurvey?.questions.map((question, questionIndex) => (
            <FormControl
              key={questionIndex}
              component="fieldset"
              sx={{ mb: 3, width: '100%' }}
            >
              <FormLabel component="legend">
                {questionIndex + 1}. {question.text}
              </FormLabel>
              <RadioGroup
                value={answers[questionIndex]}
                onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
              >
                {question.options.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button
            onClick={handleSubmitSurvey}
            variant="contained"
            color="primary"
            disabled={answers.some(answer => !answer)}
          >
            Завершити
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserSurveys; 