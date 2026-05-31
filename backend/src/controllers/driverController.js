const pool = require('../config/db');

// Barcha haydovchilar (admin)
const getAllDrivers = async (req, res) => {
  const { page = 1, limit = 20, search, is_verified, is_online, region } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  let i = 1;
  if (search) { where.push(`(d.name ILIKE $${i} OR d.phone ILIKE $${i} OR d.car_number ILIKE $${i})`); params.push(`%${search}%`); i++; }
  if (is_verified !== undefined) { where.push(`d.is_verified=$${i++}`); params.push(is_verified === 'true'); }
  if (is_online !== undefined) { where.push(`d.is_online=$${i++}`); params.push(is_online === 'true'); }
  if (region) { where.push(`d.region=$${i++}`); params.push(region); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM drivers d ${whereStr}`, params);
    params.push(limit, offset);
    const result = await pool.query(`
      SELECT d.id, d.phone, d.name, d.car_model, d.car_number, d.car_color,
             d.rating, d.total_trips, d.total_earnings, d.is_active, d.is_online,
             d.is_verified, d.region, d.created_at, d.current_lat, d.current_lng
      FROM drivers d ${whereStr}
      ORDER BY d.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, params);
    res.json({ success: true, drivers: result.rows, total: parseInt(total.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchi profili
const getDriverProfile = async (req, res) => {
  const id = req.params.id || req.user.id;
  try {
    const result = await pool.query(
      `SELECT id,phone,name,email,car_model,car_number,car_color,car_year,
              license_number,rating,total_trips,total_earnings,is_active,is_online,
              is_verified,region,current_lat,current_lng,created_at
       FROM drivers WHERE id=$1`, [id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Haydovchi topilmadi' });
    res.json({ success: true, driver: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchi lokatsiyasini yangilash
const updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const driver_id = req.user.id;
  try {
    await pool.query('UPDATE drivers SET current_lat=$1, current_lng=$2, updated_at=NOW() WHERE id=$3', [lat, lng, driver_id]);
    if (req.io) {
      // Agar aktiv trip bo'lsa, yo'lovchiga lokatsiya yuborish
      const activeTrip = await pool.query(
        `SELECT passenger_id FROM trips WHERE driver_id=$1 AND status IN ('accepted','in_progress')`, [driver_id]
      );
      if (activeTrip.rows.length) {
        req.io.to(`passenger_${activeTrip.rows[0].passenger_id}`).emit('driver_location', { lat, lng, driver_id });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Online/offline status
const toggleOnline = async (req, res) => {
  const driver_id = req.user.id;
  try {
    const result = await pool.query(
      'UPDATE drivers SET is_online=NOT is_online WHERE id=$1 RETURNING is_online', [driver_id]
    );
    res.json({ success: true, is_online: result.rows[0].is_online });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchini tasdiqlash (admin)
const verifyDriver = async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;
  try {
    await pool.query('UPDATE drivers SET is_verified=$1 WHERE id=$2', [is_verified, id]);
    res.json({ success: true, message: is_verified ? 'Haydovchi tasdiqlandi' : 'Tasdiq bekor qilindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Haydovchi statistikasi
const getDriverStats = async (req, res) => {
  const driver_id = req.params.id || req.user.id;
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status='completed') as completed_trips,
        COUNT(*) FILTER (WHERE status='cancelled') as cancelled_trips,
        COALESCE(SUM(price) FILTER (WHERE status='completed'), 0) as total_earnings,
        COALESCE(AVG(driver_rating) FILTER (WHERE driver_rating IS NOT NULL), 0) as avg_rating,
        COUNT(*) FILTER (WHERE status='completed' AND DATE(completed_at)=CURRENT_DATE) as today_trips,
        COALESCE(SUM(price) FILTER (WHERE status='completed' AND DATE(completed_at)=CURRENT_DATE), 0) as today_earnings
      FROM trips WHERE driver_id=$1
    `, [driver_id]);
    res.json({ success: true, stats: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin dashboard statistikasi
const getDashboardStats = async (req, res) => {
  try {
    const [trips, drivers, users, revenue] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='completed') as completed,
        COUNT(*) FILTER (WHERE status='searching') as searching,
        COUNT(*) FILTER (WHERE status='in_progress') as in_progress,
        COUNT(*) FILTER (WHERE DATE(created_at)=CURRENT_DATE) as today
        FROM trips`),
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_online=true) as online,
        COUNT(*) FILTER (WHERE is_verified=true) as verified FROM drivers`),
      pool.query(`SELECT COUNT(*) as total FROM users WHERE is_active=true`),
      pool.query(`SELECT COALESCE(SUM(price),0) as total,
        COALESCE(SUM(price) FILTER (WHERE DATE(completed_at)=CURRENT_DATE),0) as today
        FROM trips WHERE status='completed'`)
    ]);
    res.json({
      success: true,
      stats: {
        trips: trips.rows[0],
        drivers: drivers.rows[0],
        users: users.rows[0],
        revenue: revenue.rows[0]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllDrivers, getDriverProfile, updateLocation, toggleOnline, verifyDriver, getDriverStats, getDashboardStats };
