const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = path.join(__dirname, 'src', 'data', 'users.json');
const SURVEYS_FILE = path.join(__dirname, 'src', 'data', 'surveys.json');

// Функція для нормалізації номера телефону
const normalizePhoneNumber = (phone) => {
  // Видаляємо всі символи крім цифр
  const digits = phone.replace(/\D/g, '');
  // Якщо номер починається з 38, видаляємо цей префікс
  return digits.startsWith('38') ? digits.slice(2) : digits;
};

// Функція для читання даних з файлу
const readUsersFile = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

// Функція для запису даних у файл
const writeUsersFile = (data) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
};

// Функція для читання опитувань
const readSurveysFile = () => {
  try {
    const data = fs.readFileSync(SURVEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { surveys: [] };
  }
};

// Функція для запису опитувань
const writeSurveysFile = (data) => {
  fs.writeFileSync(SURVEYS_FILE, JSON.stringify(data, null, 2));
};

// Отримати всіх користувачів
app.get('/api/users', (req, res) => {
  const data = readUsersFile();
  res.json(data);
});

// Додати нового користувача
app.post('/api/users', (req, res) => {
  const data = readUsersFile();
  const newUser = req.body;
  
  // Нормалізуємо номер телефону для порівняння
  const normalizedNewPhone = normalizePhoneNumber(newUser.phone);
  
  // Перевіряємо, чи користувач з таким номером телефону вже існує
  const existingUser = data.users.find(user => 
    normalizePhoneNumber(user.phone) === normalizedNewPhone
  );
  
  if (existingUser) {
    return res.status(400).json({ error: 'Користувач з таким номером телефону вже існує' });
  }

  // Зберігаємо номер телефону в форматі з маскою
  newUser.phone = newUser.phone;
  
  data.users.push(newUser);
  writeUsersFile(data);
  res.json(newUser);
});

// Видалити користувача
app.delete('/api/users/:phone', (req, res) => {
  const data = readUsersFile();
  const phoneToDelete = req.params.phone;
  
  // Нормалізуємо номер телефону для порівняння
  const normalizedPhoneToDelete = normalizePhoneNumber(phoneToDelete);
  
  // Знаходимо індекс користувача для видалення
  const userIndex = data.users.findIndex(user => 
    normalizePhoneNumber(user.phone) === normalizedPhoneToDelete
  );
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Користувача не знайдено' });
  }
  
  // Видаляємо користувача
  data.users.splice(userIndex, 1);
  writeUsersFile(data);
  
  res.json({ message: 'Користувача успішно видалено' });
});

// Отримати всі опитування
app.get('/api/surveys', (req, res) => {
  const data = readSurveysFile();
  res.json(data);
});

// Створити нове опитування
app.post('/api/surveys', (req, res) => {
  console.log('Отримано запит на створення опитування:', req.body);
  
  const data = readSurveysFile();
  const newSurvey = {
    ...req.body,
    id: Date.now().toString(), // Генеруємо унікальний ID
    createdAt: new Date().toISOString(),
    responses: [] // Масив для зберігання відповідей
  };
  
  // Перевіряємо структуру даних
  if (!newSurvey.title || !newSurvey.description || !Array.isArray(newSurvey.questions)) {
    console.error('Некоректна структура опитування:', newSurvey);
    return res.status(400).json({ error: 'Некоректна структура опитування' });
  }

  // Перевіряємо кожне питання
  for (const question of newSurvey.questions) {
    if (!question.text || !Array.isArray(question.options) || question.options.length === 0) {
      console.error('Некоректна структура питання:', question);
      return res.status(400).json({ error: 'Некоректна структура питання' });
    }
  }
  
  console.log('Зберігаємо нове опитування:', newSurvey);
  data.surveys.push(newSurvey);
  writeSurveysFile(data);
  console.log('Опитування успішно збережено');
  res.json(newSurvey);
});

// Видалити опитування
app.delete('/api/surveys/:id', (req, res) => {
  const data = readSurveysFile();
  const surveyId = req.params.id;
  
  const surveyIndex = data.surveys.findIndex(survey => survey.id === surveyId);
  
  if (surveyIndex === -1) {
    return res.status(404).json({ error: 'Опитування не знайдено' });
  }
  
  data.surveys.splice(surveyIndex, 1);
  writeSurveysFile(data);
  
  res.json({ message: 'Опитування успішно видалено' });
});

// Додати відповідь на опитування
app.post('/api/surveys/:id/responses', (req, res) => {
  const data = readSurveysFile();
  const surveyId = req.params.id;
  const response = req.body;
  
  const survey = data.surveys.find(s => s.id === surveyId);
  if (!survey) {
    return res.status(404).json({ error: 'Опитування не знайдено' });
  }
  
  survey.responses.push({
    ...response,
    createdAt: new Date().toISOString()
  });
  
  writeSurveysFile(data);
  res.json(survey);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 