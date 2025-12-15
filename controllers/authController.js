const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT id, email, password, role FROM employees WHERE email = ?;
`;

    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password', err: err });
        }

        const user = result[0];
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            employee: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    });
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

/* ================= LOGOUT ================= */
exports.logout = (req, res) => {
    // No backend logout needed (same as Supabase)
    res.json({ message: 'Logged out successfully' });
};
