const db = require('../config/db');

/* ================= MY RECORDS ================= */
exports.myRecords = (req, res) => {
  const sql = `
    SELECT *
    FROM clock_records
    WHERE employee_id = ?
    ORDER BY clock_in DESC
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch clock records' });
    res.json(result);
  });
};

/* ================= ACTIVE RECORD ================= */
exports.activeRecord = (req, res) => {
  const sql = `
    SELECT *
    FROM clock_records
    WHERE employee_id = ?
      AND clock_out IS NULL
    ORDER BY clock_in DESC
    LIMIT 1
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch active clock record' });
    res.json(result[0] || null);
  });
};

exports.clockIn = (req, res) => {
    console.log('CLOCK-IN req.user:', req.user); 

  const checkSql = `
    SELECT id FROM clock_records
    WHERE employee_id = ?
      AND clock_out IS NULL
    LIMIT 1
  `;

  db.query(checkSql, [req.user.id], (err, active) => {
    if (err) return res.status(500).json({ error: 'Clock-in check failed' });

    if (active.length > 0) {
      return res.status(400).json({ error: 'You are already clocked in' });
    }

    const insertSql = `
      INSERT INTO clock_records (employee_id, clock_in)
      VALUES (?, NOW())
    `;

    db.query(insertSql, [req.user.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to clock in' });

      res.status(201).json({
        id: result.insertId,
        employee_id: req.user.id,
        clock_in: new Date()
      });
    });
  });
};

/* ================= CLOCK OUT ================= */
exports.clockOut = (req, res) => {
  const findSql = `
    SELECT *
    FROM clock_records
    WHERE employee_id = ?
      AND clock_out IS NULL
    ORDER BY clock_in DESC
    LIMIT 1
  `;

  db.query(findSql, [req.user.id], (err, records) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch active record' });

    if (records.length === 0) {
      return res.status(400).json({ error: 'No active clock-in record found' });
    }

    const recordId = records[0].id;

    const updateSql = `
      UPDATE clock_records
      SET clock_out = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [recordId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to clock out' });

      res.json({
        ...records[0],
        clock_out: new Date()
      });
    });
  });
};

/* ================= ALL RECORDS (ADMIN) ================= */
exports.allRecords = (req, res) => {
  const sql = `
    SELECT cr.*, e.full_name, e.email, e.department
    FROM clock_records cr
    JOIN employees e ON e.id = cr.employee_id
    ORDER BY cr.clock_in DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch all records' });
    res.json(result);
  });
};

/* ================= EMPLOYEE RECORDS (ADMIN) ================= */
exports.employeeRecords = (req, res) => {
  const sql = `
    SELECT *
    FROM clock_records
    WHERE employee_id = ?
    ORDER BY clock_in DESC
  `;

  db.query(sql, [req.params.employeeId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employee records' });
    res.json(result);
  });
};
