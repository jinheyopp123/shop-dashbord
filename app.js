const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 회원가입
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run('INSERT INTO Users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], (err) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.redirect('/login');
  });
});

// 로그인
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM Users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials.');
    }
    req.session.userId = user.id;
    res.redirect('/dashboard');
  });
});

// 로그아웃
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// 대시보드
app.get('/dashboard', (req, res) => {
  // 사용자가 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  db.all('SELECT * FROM tasks', (err, tasks) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.render('dashboard', { tasks });
  });
});

// 작업 상태 업데이트
app.post('/update-task-status', (req, res) => {
  const { taskId, status } = req.body;

  db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], (err) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
