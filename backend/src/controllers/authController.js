const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ─── PASSENGER ─────────────────────────────────────────────
const registerPassenger = async (req, res) => {
  const { phone, name, password } = req.body;
  if (!phone || !password) return res.status(400).json({ success: false, message: 'Telefon va parol kiritilishi shart' });
  try {
    const exists = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);
    if (exists.rows.length > 0) return res.status(400).json({ success: false, message: 'Bu telefon allaqachon ro\'yxatdan o\'tgan' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (phone, name, password_hash) VALUES ($1,$2,$3) RETURNING id,phone,name,rating',
      [phone, name || 'Foydalanuvchi', hash]
    );
    const user = result.rows[0];
    const token = generateToken({ id: user.id, role: 'passenger' });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginPassenger = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE phone=$1 AND is_active=true', [phone]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Parol noto\'g\'ri' });
    const token = generateToken({ id: user.id, role: 'passenger' });
    const { password_hash, ...safe } = user;
    res.json({ success: true, token, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DRIVER ────────────────────────────────────────────────
const registerDriver = async (req, res) => {
  const { phone, name, password, car_model, car_number, car_color, car_year, license_number, region } = req.body;
  if (!phone || !name || !password) return res.status(400).json({ success: false, message: 'Majburiy maydonlar to\'ldirilmagan' });
  try {
    const exists = await pool.query('SELECT id FROM drivers WHERE phone=$1', [phone]);
    if (exists.rows.length > 0) return res.status(400).json({ success: false, message: 'Bu telefon allaqachon ro\'yxatdan o\'tgan' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO drivers (phone,name,password_hash,car_model,car_number,car_color,car_year,license_number,region)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,phone,name,car_model,car_number,rating,is_verified`,
      [phone, name, hash, car_model, car_number, car_color, car_year, license_number, region]
    );
    const driver = result.rows[0];
    const token = generateToken({ id: driver.id, role: 'driver' });
    res.status(201).json({ success: true, token, driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginDriver = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM drivers WHERE phone=$1 AND is_active=true', [phone]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Haydovchi topilmadi' });
    const driver = result.rows[0];
    const valid = await bcrypt.compare(password, driver.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Parol noto\'g\'ri' });
    const token = generateToken({ id: driver.id, role: 'driver' });
    const { password_hash, ...safe } = driver;
    res.json({ success: true, token, driver: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ─────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  // Demo: admin/admin123 — real loyihada DB dan oling
  if (username === 'admin' && password === 'admin123') {
    const token = generateToken({ id: 'admin-001', role: 'admin', username: 'admin' });
    return res.json({ success: true, token, user: { id: 'admin-001', username: 'admin', role: 'admin' } });
  }
  res.status(401).json({ success: false, message: 'Login yoki parol noto\'g\'ri' });
};

module.exports = { registerPassenger, loginPassenger, registerDriver, loginDriver, loginAdmin };
