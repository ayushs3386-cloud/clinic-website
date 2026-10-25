require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'API running' }));

// Public: list services
app.get('/api/services', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, price_from FROM services WHERE is_active = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: submit appointment
app.post('/api/appointments', async (req, res) => {
  const { patient_name, phone, email, service, preferred_date, preferred_time, message } = req.body;

  // Plain validation
  if (!patient_name || patient_name.length < 2) {
    return res.status(400).json({ error: 'Please enter your name' });
  }
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  }
  if (!service || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'Service, date and time are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO appointments
       (patient_name, phone, email, service, preferred_date, preferred_time, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [patient_name, phone, email || null, service, preferred_date, preferred_time, message || null]
    );
    res.status(201).json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, password_hash FROM admins WHERE username = $1',
      [username]
    );
    const admin = rows[0];

    // Same message for wrong username or wrong password
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }

  const token = header.split(' ')[1];

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// View all appointments (newest first)
app.get('/api/admin/appointments', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, patient_name, phone, email, service,
          to_char(preferred_date, 'YYYY-MM-DD') AS preferred_date,
          preferred_time, message, status, created_at
   FROM appointments ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change an appointment's status
app.patch('/api/admin/appointments/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an appointment
app.delete('/api/admin/appointments/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM appointments WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));