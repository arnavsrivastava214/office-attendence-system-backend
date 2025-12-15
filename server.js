require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Controllers
const {
  login,
  register,
  logout
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

// ✅ CREATE APP FIRST
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ================= AUTH =================
app.post('/api/login', login);
app.post('/api/register', register);
app.post('/api/logout', logout);

// ================= EMPLOYEES =================
app.get('/api/employees/me', authenticateToken, me);
app.get('/api/employees', authenticateToken, requireAdmin, getAll);
app.get('/api/employees/:id', authenticateToken, requireAdmin, getById);
app.put('/api/employees/:id', authenticateToken, requireAdmin, update);
app.delete('/api/employees/:id', authenticateToken, requireAdmin, remove);

// ================= CLOCK RECORDS =================
app.get('/api/clock-records/my-records', authenticateToken, myRecords);
app.get('/api/clock-records/active', authenticateToken, activeRecord);
app.post('/api/clock-records/clock-in', authenticateToken, clockIn);
app.post('/api/clock-records/clock-out', authenticateToken, clockOut);
app.get('/api/clock-records/all', authenticateToken, requireAdmin, allRecords);
app.get(
  '/api/clock-records/employee/:employeeId',
  authenticateToken,
  requireAdmin,
  employeeRecords
);

// ================= ROOT =================
app.get('/', (req, res) => {
  res.json({ message: 'Office Attendance API running' });
});

// ✅ START SERVER LAST
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
