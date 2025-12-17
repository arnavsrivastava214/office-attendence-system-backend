const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Login photo is required' });
    }

    const sql = `
      SELECT id, email, password, role
      FROM employees
      WHERE email = ?
      LIMIT 1
    `;

    db.query(sql, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result[0];
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // ✅ SAVE PHOTO PATH
      const photoPath = `/uploads/login/${req.file.filename}`;

      db.query(
        'UPDATE employees SET login_photo = ? WHERE id = ?',
        [photoPath, user.id]
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        employee: {
          id: user.id,
          email: user.email,
          role: user.role,
          login_photo: photoPath
        }
      });
    });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

  

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
    try {
        const {
            email,
            password,
            full_name,
            role,
            phone,
            department,
            position
        } = req.body;

        const hashedPassword = await hashPassword(password);
        const id = uuidv4();

        const sql = `
      INSERT INTO employees
      (id, email, password, full_name, role, phone, department, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        db.query(
            sql,
            [
                id,
                email,
                hashedPassword,
                full_name,
                role || 'employee',
                phone,
                department,
                position
            ],
            (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Registration failed' });
                }

                res.status(201).json({
                    message: 'Employee registered successfully',
                    user: { id, email }
                });
            }
        );
    } catch {
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const sql = `
      SELECT id, email, password, role
      FROM employees
      WHERE email = ?
      LIMIT 1
    `;

    db.query(sql, [email], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const admin = result[0];

      const isMatch = await comparePassword(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.status(200).json({
        user: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    });

  } catch (error) {
    res.status(500).json({ error: 'Admin login failed' });
  }
};


