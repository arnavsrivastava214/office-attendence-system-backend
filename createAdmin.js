require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');


async function createAdminUser() {
  const adminData = {
    id: 'admin-001',
    email: 'admin@example.com',
    password: 'admin123',
    full_name: 'System Administrator',
    role: 'admin',
    department: 'IT',
    position: 'Administrator',
    phone: '1234567890'
  };

  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  const sql = `
    INSERT INTO employees
    (id, email, password, full_name, role, phone, department, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.execute(sql, [
    adminData.id,
    adminData.email,
    hashedPassword,
    adminData.full_name,
    adminData.role,
    adminData.phone,
    adminData.department,
    adminData.position
  ], (err) => {
    if (err) {
      console.error('Error creating admin:', err.message);
    } else {
      console.log('Admin user created successfully');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
    }
    process.exit(0);
  });
}

db.query('SELECT 1', (err) => {
    if (err) console.error('DB ERROR:', err);
    else console.log('DB CONNECTED');
  });
  

createAdminUser();
