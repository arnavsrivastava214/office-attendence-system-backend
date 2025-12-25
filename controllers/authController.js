const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const db = require('../config/db');
const { comparePassword } = require('../utils/password');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');



const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'office_attendance/login' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password, latitude, longitude, accuracy } = req.body;

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
        return res.status(500).json({ error: 'Database error', err });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result[0];
      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // 🔥 UPLOAD IMAGE TO CLOUDINARY
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      const photoUrl = uploadResult.secure_url; // ✅ THIS IS WHAT WE STORE

      let locationName = null;

      if (latitude && longitude) {
        try {
          const geoRes = await axios.get(
            'https://nominatim.openstreetmap.org/reverse',
            {
              params: {
                format: 'json',
                lat: latitude,
                lon: longitude
              },
              headers: {
                'User-Agent': 'OfficeAttendanceSystem/1.0'
              }
            }
          );
          locationName = geoRes.data.display_name;
        } catch (geoErr) {
          console.error('Reverse geocode failed:', geoErr.message);
        }
      }

      db.query(
        `
        UPDATE employees
        SET 
          login_photo = ?,
          login_locations = JSON_ARRAY_APPEND(
            IFNULL(login_locations, JSON_ARRAY()),
            '$',
            JSON_OBJECT(
              'latitude', ?,
              'longitude', ?,
              'accuracy', ?,
              'location', ?,
              'time', NOW()
            )
          )
        WHERE id = ?
        `,
        [
          photoUrl,
          latitude || null,
          longitude || null,
          accuracy || null,
          locationName,
          user.id
        ]
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
          login_photo: photoUrl
        },
        login_location: {
          latitude,
          longitude,
          accuracy,
          location: locationName
        }
      });
    });
  } catch (error) {
    console.error(error);
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

    const id = uuidv4(); // 🔥 GUARANTEED UNIQUE

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
          console.error(err);
          return res.status(500).json({ error: 'Registration failed' });
        }

        res.status(201).json({
          message: 'Employee registered successfully',
          user: { id, email }
        });
      }
    );
  } catch (err) {
    console.error(err);
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
        return res.status(500).json({ error: 'Database error' , err: err});
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

exports.getLoginLocations = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT login_locations FROM employees WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' , err: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json({
        login_locations: result[0].login_locations || []
      });
    }
  );
};



