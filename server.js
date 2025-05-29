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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 