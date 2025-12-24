const db = require('../config/db');

/* ================= MY PROFILE ================= */
exports.me = (req, res) => {
  const sql = `SELECT * FROM employees WHERE id = ? LIMIT 1`;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employee data' });
    res.json(result[0] || null);
  });
};

/* ================= ALL EMPLOYEES (ADMIN) ================= */
exports.getAll = (req, res) => {
  const sql = `
    SELECT *
    FROM employees
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employees' });
    res.json(result);
  });
};

/* ================= GET EMPLOYEE BY ID (ADMIN) ================= */
exports.getById = (req, res) => {
  const sql = `SELECT * FROM employees WHERE id = ? LIMIT 1`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employee' });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result[0]);
  });
};

/* ================= UPDATE EMPLOYEE (ADMIN) ================= */
exports.update = (req, res) => {
  const {
    full_name = null,
    phone = null,
    department = null,
    position = null,
    role = 'employee'
  } = req.body;

  const sql = `
    UPDATE employees
    SET full_name=?, phone=?, department=?, position=?, role=?
    WHERE id=?
  `;

  db.query(
    sql,
    [full_name, phone, department, position, role, req.params.id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update employee' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({ message: 'Employee updated successfully' });
    }
  );
};

/* ================= DELETE EMPLOYEE (ADMIN) ================= */
exports.remove = (req, res) => {
  const sql = `DELETE FROM employees WHERE id = ?`;

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete employee' });

    res.json({ message: 'Employee deleted successfully' });
  });
};
