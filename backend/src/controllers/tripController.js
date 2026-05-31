const pool = require('../config/db');

// Haydovchi topish (eng yaqin)
const findNearestDrivers = async (lat, lng, radiusKm = 10) => {
  const result = await pool.query(`
    SELECT id, name, car_model, car_number, car_color, rating,
           current_lat, current_lng,
           ( 6371 * acos( cos(radians($1)) * cos(radians(current_lat))
             * cos(radians(current_lng) - radians($2))
             + sin(radians($1)) * sin(radians(current_lat)) ) ) AS distance_km
    FROM drivers
    WHERE is_online=true AND is_active=true AND is_verified=true
      AND current_lat IS NOT NULL AND current_lng IS NOT NULL
    HAVING ( 6371 * acos( cos(radians($1)) * cos(radians(current_lat))
             * cos(radians(current_lng) - radians($2))
             + sin(radians($1)) * sin(radians(current_lat)) ) ) < $3
    ORDER BY distance_km
    LIMIT 5
  `, [lat, lng, radiusKm]);
  return result.rows;
};

// Narx hisoblash
const calculatePrice = (distanceKm, regionBasePrize = 8000, pricePerKm = 2000) => {
  return Math.round(regionBasePrize + distanceKm * pricePerKm);
};

// Distansiya hisoblash (Haversine)
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ── Yangi trip yaratish ──────────────────────────────────────
const createTrip = async (req, res) => {
  const { from_address, from_lat, from_lng, to_address, to_lat, to_lng, payment_method } = req.body;
  const passenger_id = req.user.id;
  try {
    const distanceKm = haversine(from_lat, from_lng, to_lat, to_lng);
    const price = calculatePrice(distanceKm);
    const result = await pool.query(
      `INSERT INTO trips (passenger_id,from_address,from_lat,from_lng,to_address,to_lat,to_lng,distance_km,price,payment_method,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'searching') RETURNING *`,
      [passenger_id, from_address, from_lat, from_lng, to_address, to_lat, to_lng,
       distanceKm.toFixed(2), price, payment_method || 'cash']
    );
    const trip = result.rows[0];

    // Yaqin haydovchilarni topish
    const nearbyDrivers = await findNearestDrivers(from_lat, from_lng);

    // Socket orqali haydovchilarga yuborish (server.js da io ishlatiladi)
    if (req.io) {
      nearbyDrivers.forEach(driver => {
        req.io.to(`driver_${driver.id}`).emit('new_trip_request', { trip, distance: driver.distance_km });
      });
    }

    res.status(201).json({ success: true, trip, estimated_price: price, nearby_drivers: nearbyDrivers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Haydovchi trip qabul qiladi ──────────────────────────────
const acceptTrip = async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user.id;
  try {
    const check = await pool.query('SELECT * FROM trips WHERE id=$1 AND status=$2', [trip_id, 'searching']);
    if (!check.rows.length) return res.status(400).json({ success: false, message: 'Trip mavjud emas yoki allaqachon qabul qilingan' });
    const result = await pool.query(
      `UPDATE trips SET driver_id=$1, status='accepted' WHERE id=$2 RETURNING *`,
      [driver_id, trip_id]
    );
    const trip = result.rows[0];
    if (req.io) {
      req.io.to(`passenger_${trip.passenger_id}`).emit('trip_accepted', { trip, driver_id });
    }
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Trip boshlandi ───────────────────────────────────────────
const startTrip = async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user.id;
  try {
    const result = await pool.query(
      `UPDATE trips SET status='in_progress', started_at=NOW() WHERE id=$1 AND driver_id=$2 AND status='accepted' RETURNING *`,
      [trip_id, driver_id]
    );
    if (!result.rows.length) return res.status(400).json({ success: false, message: 'Trip topilmadi' });
    const trip = result.rows[0];
    if (req.io) req.io.to(`passenger_${trip.passenger_id}`).emit('trip_started', { trip });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Trip tugadi ──────────────────────────────────────────────
const completeTrip = async (req, res) => {
  const { trip_id } = req.params;
  const driver_id = req.user.id;
  try {
    const result = await pool.query(
      `UPDATE trips SET status='completed', completed_at=NOW() WHERE id=$1 AND driver_id=$2 AND status='in_progress' RETURNING *`,
      [trip_id, driver_id]
    );
    if (!result.rows.length) return res.status(400).json({ success: false, message: 'Trip topilmadi' });
    const trip = result.rows[0];
    // Haydovchi daromadini yangilash
    await pool.query('UPDATE drivers SET total_trips=total_trips+1, total_earnings=total_earnings+$1 WHERE id=$2', [trip.price, driver_id]);
    await pool.query('UPDATE users SET total_trips=total_trips+1 WHERE id=$1', [trip.passenger_id]);
    if (req.io) req.io.to(`passenger_${trip.passenger_id}`).emit('trip_completed', { trip });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Trip bekor qilish ────────────────────────────────────────
const cancelTrip = async (req, res) => {
  const { trip_id } = req.params;
  const { cancel_reason } = req.body;
  const userId = req.user.id;
  const role = req.user.role;
  try {
    const whereClause = role === 'passenger' ? `passenger_id='${userId}'` : `driver_id='${userId}'`;
    const result = await pool.query(
      `UPDATE trips SET status='cancelled', cancelled_at=NOW(), cancel_reason=$1
       WHERE id=$2 AND ${whereClause} AND status IN ('searching','accepted') RETURNING *`,
      [cancel_reason, trip_id]
    );
    if (!result.rows.length) return res.status(400).json({ success: false, message: 'Trip topilmadi' });
    const trip = result.rows[0];
    if (req.io) {
      const targetId = role === 'passenger' ? trip.driver_id : trip.passenger_id;
      const targetRoom = role === 'passenger' ? `driver_${targetId}` : `passenger_${targetId}`;
      if (targetId) req.io.to(targetRoom).emit('trip_cancelled', { trip, cancelled_by: role });
    }
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Trip baholash ────────────────────────────────────────────
const rateTrip = async (req, res) => {
  const { trip_id } = req.params;
  const { rating, comment } = req.body;
  const role = req.user.role;
  const userId = req.user.id;
  try {
    let query, params;
    if (role === 'passenger') {
      query = `UPDATE trips SET driver_rating=$1, passenger_comment=$2 WHERE id=$3 AND passenger_id=$4 AND status='completed' RETURNING driver_id`;
      params = [rating, comment, trip_id, userId];
    } else {
      query = `UPDATE trips SET passenger_rating=$1, driver_comment=$2 WHERE id=$3 AND driver_id=$4 AND status='completed' RETURNING passenger_id`;
      params = [rating, comment, trip_id, userId];
    }
    const result = await pool.query(query, params);
    if (!result.rows.length) return res.status(400).json({ success: false, message: 'Trip topilmadi' });

    // O'rtacha ratingni yangilash
    if (role === 'passenger') {
      const driverId = result.rows[0].driver_id;
      await pool.query(`UPDATE drivers SET rating=(SELECT AVG(driver_rating) FROM trips WHERE driver_id=$1 AND driver_rating IS NOT NULL) WHERE id=$1`, [driverId]);
    } else {
      const passengerId = result.rows[0].passenger_id;
      await pool.query(`UPDATE users SET rating=(SELECT AVG(passenger_rating) FROM trips WHERE passenger_id=$1 AND passenger_rating IS NOT NULL) WHERE id=$1`, [passengerId]);
    }
    res.json({ success: true, message: 'Baholash qabul qilindi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Triplar ro'yxati (admin) ─────────────────────────────────
const getAllTrips = async (req, res) => {
  const { page = 1, limit = 20, status, from_date, to_date } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let params = [];
  let i = 1;
  if (status) { where.push(`t.status=$${i++}`); params.push(status); }
  if (from_date) { where.push(`t.created_at>=$${i++}`); params.push(from_date); }
  if (to_date) { where.push(`t.created_at<=$${i++}`); params.push(to_date); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  try {
    const total = await pool.query(`SELECT COUNT(*) FROM trips t ${whereStr}`, params);
    params.push(limit, offset);
    const result = await pool.query(`
      SELECT t.*, u.name as passenger_name, u.phone as passenger_phone,
             d.name as driver_name, d.phone as driver_phone, d.car_model, d.car_number
      FROM trips t
      LEFT JOIN users u ON t.passenger_id=u.id
      LEFT JOIN drivers d ON t.driver_id=d.id
      ${whereStr}
      ORDER BY t.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, params);
    res.json({ success: true, trips: result.rows, total: parseInt(total.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Foydalanuvchi triplar tarixi ─────────────────────────────
const getMyTrips = async (req, res) => {
  const { id, role } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const col = role === 'passenger' ? 'passenger_id' : 'driver_id';
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as passenger_name, d.name as driver_name, d.car_model, d.car_number
      FROM trips t
      LEFT JOIN users u ON t.passenger_id=u.id
      LEFT JOIN drivers d ON t.driver_id=d.id
      WHERE t.${col}=$1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);
    res.json({ success: true, trips: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTrip, acceptTrip, startTrip, completeTrip, cancelTrip, rateTrip, getAllTrips, getMyTrips };
