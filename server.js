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
const SUGGESTIONS_FILE = path.join(__dirname, 'src', 'data', 'suggestions.json');

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

// Функція для читання пропозицій
const readSuggestionsFile = () => {
  try {
    const data = fs.readFileSync(SUGGESTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Якщо файл не існує, створюємо його з пустим масивом пропозицій
    const initialData = { suggestions: [] };
    writeSuggestionsFile(initialData);
    return initialData;
  }
};

// Функція для запису пропозицій
const writeSuggestionsFile = (data) => {
  try {
    // Переконуємося, що директорія існує
    const dir = path.dirname(SUGGESTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Помилка при записі файлу пропозицій:', error);
    throw error;
  }
};

// Отримати всіх користувачів
app.get('/api/users', (req, res) => {
  const data = readUsersFile();
  res.json(data);
});

// Додати нового користувача
app.post('/api/users', (req, res) => {
  const data = readUsersFile();
  const newUser = {
    ...req.body,
    id: Date.now().toString() // Генеруємо унікальний ID
  };
  
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

// Отримати всі пропозиції
app.get('/api/suggestions', (req, res) => {
  const data = readSuggestionsFile();
  const userId = req.query.userId;

  if (userId) {
    // Фільтруємо пропозиції за userId, якщо він присутній у запиті
    const userSuggestions = data.suggestions.filter(suggestion => suggestion.userId === userId);
    res.json({ suggestions: userSuggestions });
  } else {
    // Якщо userId не вказано (наприклад, для адміна), повертаємо всі пропозиції
    res.json(data);
  }
});

// Створити нову пропозицію
app.post('/api/suggestions', (req, res) => {
  console.log('Отримано запит на створення пропозиції:', req.body);
  console.log('Тип даних:', typeof req.body);
  console.log('Вміст запиту:', JSON.stringify(req.body, null, 2));
  
  const data = readSuggestionsFile();
  const newSuggestion = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  console.log('Підготовлена пропозиція:', newSuggestion);
  console.log('Перевірка полів:');
  console.log('- content:', newSuggestion.content);
  console.log('- priority:', newSuggestion.priority);
  console.log('- userId:', newSuggestion.userId);

  if (!newSuggestion.content || !newSuggestion.priority || !newSuggestion.userId) {
    console.error('Некоректна структура пропозиції:', newSuggestion);
    return res.status(400).json({ 
      error: 'Некоректна структура пропозиції',
      details: {
        content: !!newSuggestion.content,
        priority: !!newSuggestion.priority,
        userId: !!newSuggestion.userId
      }
    });
  }

  try {
    data.suggestions.push(newSuggestion);
    writeSuggestionsFile(data);
    console.log('Пропозицію успішно збережено');
    res.json(newSuggestion);
  } catch (error) {
    console.error('Помилка при збереженні пропозиції:', error);
    res.status(500).json({ error: 'Помилка при збереженні пропозиції' });
  }
});

// Оновити статус пропозиції
app.patch('/api/suggestions/:id', (req, res) => {
  const data = readSuggestionsFile();
  const suggestionId = req.params.id;
  const { status } = req.body;

  const suggestion = data.suggestions.find(s => s.id === suggestionId);
  if (!suggestion) {
    return res.status(404).json({ error: 'Пропозицію не знайдено' });
  }

  if (!['pending', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Некоректний статус' });
  }

  suggestion.status = status;
  writeSuggestionsFile(data);
  res.json(suggestion);
});

// Видалити пропозицію
app.delete('/api/suggestions/:id', (req, res) => {
  const data = readSuggestionsFile();
  const suggestionId = req.params.id;

  const suggestionIndex = data.suggestions.findIndex(s => s.id === suggestionId);
  if (suggestionIndex === -1) {
    return res.status(404).json({ error: 'Пропозицію не знайдено' });
  }

  data.suggestions.splice(suggestionIndex, 1);
  writeSuggestionsFile(data);
  res.json({ message: 'Пропозицію успішно видалено' });
});

// Логін користувача
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const data = readUsersFile();

  // Перевіряємо адміністратора
  if (phone === data.admin.phone && password === data.admin.password) {
    return res.json({
      name: 'Admin',
      phone: data.admin.phone,
      isAdmin: true,
      id: 'admin'
    });
  }

  // Шукаємо користувача
  const user = data.users.find(u => 
    normalizePhoneNumber(u.phone) === normalizePhoneNumber(phone) && 
    u.password === password
  );

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      ...userWithoutPassword,
      isAdmin: false
    });
  }

  res.status(401).json({ error: 'Невірний номер телефону або пароль' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 