if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');

const upload = require('./middleware/upload');

const { authenticateToken, requireAdmin } = require('./middleware/auth');

const {
  login,
  register,
  adminLogin,
  logout,
  getLoginLocations
} = require('./controllers/authController');

const {
  myRecords,
  activeRecord,
  clockIn,
  clockOut,
  allRecords,
  employeeRecords
} = require('./controllers/clockController');

const {
  me,
  getAll,
  getById,
  update,
  remove
} = require('./controllers/employeeController');

// ================= CREATE APP =================
const app = express();
const PORT = process.env.PORT || 3000;

// ================= GLOBAL MIDDLEWARE =================
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= AUTH ROUTES =================
app.post('/api/login', upload.single('photo'), login);
app.post('/api/register', register);
app.post('/api/admin/login', adminLogin);
app.post('/api/logout', logout);
app.get('/api/employees/:id/login-locations', getLoginLocations);

/// ================= EMPLOYEES =================
app.get('/api/employees/me', authenticateToken, me);
app.get('/api/employees', authenticateToken, requireAdmin, getAll);
app.get('/api/employees/:id', authenticateToken, requireAdmin, getById);
app.put('/api/employees/:id', authenticateToken, requireAdmin, update);
app.delete('/api/employees/:id', authenticateToken, requireAdmin, remove);

// ================= CLOCK RECORDS =================
app.get('/api/my-records', authenticateToken, myRecords);
app.get('/api/active', authenticateToken, activeRecord);
app.post('/api/clock-in', authenticateToken, clockIn);
app.post('/api/clock-out', authenticateToken, clockOut);
app.get('/api/all', authenticateToken, requireAdmin, allRecords);
app.get('/api/employee/:employeeId', authenticateToken, requireAdmin, employeeRecords);



// ================= HEALTH CHECK =================
app.get('/', (req, res) => {
  res.json({ message: 'Office Attendance API running' });
});

// ================= START SERVER =================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
