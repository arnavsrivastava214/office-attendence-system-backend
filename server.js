if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// ================= MULTER CONFIG =================

const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads/login');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/login');
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// ================= AUTH MIDDLEWARE =================
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// ================= CONTROLLERS =================
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 SERVE UPLOADED IMAGES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= AUTH ROUTES =================
app.post('/api/login', upload.single('photo'), login);
app.post('/api/register', register);
app.post('/api/admin/login', adminLogin);
app.post('/api/logout', logout);
app.get('/api/employees/:id/login-locations', getLoginLocations);


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

app.get('/', (req, res) => {
  res.json({ message: 'Office Attendance API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
