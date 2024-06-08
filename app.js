const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const flash = require('connect-flash');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 로그인 여부를 확인하는 미들웨어
const ensureAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    req.flash('error_msg', '로그인 후 사용해 주세요.');
    res.redirect('/login');
  }
};

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
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  db.all('SELECT * FROM Tasks', (err, tasks) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.render('dashboard', { tasks });
  });
});

app.post('/tasks', ensureAuthenticated, (req, res) => {
  const { task_name, worker_name } = req.body;

  db.run('INSERT INTO Tasks (task_name, worker_name) VALUES (?, ?)', [task_name, worker_name], (err) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.redirect('/dashboard');
  });
});

// 작업 상태 업데이트
app.post('/tasks/update', ensureAuthenticated, (req, res) => {
  const { task_id, status } = req.body;

  db.run('UPDATE Tasks SET status = ? WHERE task_id = ?', [status, task_id], (err) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
