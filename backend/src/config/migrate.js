const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table (passengers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        password_hash VARCHAR(255),
        avatar_url VARCHAR(255),
        rating DECIMAL(3,2) DEFAULT 5.0,
        total_trips INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Drivers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255),
        license_number VARCHAR(50) UNIQUE,
        car_model VARCHAR(100),
        car_number VARCHAR(20),
        car_color VARCHAR(50),
        car_year INTEGER,
        rating DECIMAL(3,2) DEFAULT 5.0,
        total_trips INTEGER DEFAULT 0,
        total_earnings DECIMAL(12,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_online BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        current_lat DECIMAL(10,8),
        current_lng DECIMAL(11,8),
        region VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Trips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passenger_id UUID REFERENCES users(id),
        driver_id UUID REFERENCES drivers(id),
        status VARCHAR(30) DEFAULT 'searching',
        from_address VARCHAR(255) NOT NULL,
        from_lat DECIMAL(10,8) NOT NULL,
        from_lng DECIMAL(11,8) NOT NULL,
        to_address VARCHAR(255) NOT NULL,
        to_lat DECIMAL(10,8) NOT NULL,
        to_lng DECIMAL(11,8) NOT NULL,
        distance_km DECIMAL(8,2),
        duration_min INTEGER,
        price DECIMAL(10,2),
        payment_method VARCHAR(20) DEFAULT 'cash',
        passenger_rating INTEGER,
        driver_rating INTEGER,
        passenger_comment TEXT,
        driver_comment TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Regions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_uz VARCHAR(100),
        base_price DECIMAL(10,2) DEFAULT 5000,
        price_per_km DECIMAL(8,2) DEFAULT 1500,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Insert O'zbekiston viloyatlari
    await client.query(`
      INSERT INTO regions (name, name_uz, base_price, price_per_km) VALUES
        ('Toshkent', 'Toshkent', 8000, 2000),
        ('Samarqand', 'Samarqand', 6000, 1800),
        ('Buxoro', 'Buxoro', 6000, 1800),
        ('Farg''ona', 'Farg''ona', 6000, 1800),
        ('Andijon', 'Andijon', 6000, 1800),
        ('Namangan', 'Namangan', 6000, 1800),
        ('Qashqadaryo', 'Qashqadaryo', 5000, 1500),
        ('Surxondaryo', 'Surxondaryo', 5000, 1500),
        ('Xorazm', 'Xorazm', 5000, 1500),
        ('Navoiy', 'Navoiy', 5000, 1500),
        ('Jizzax', 'Jizzax', 5000, 1500),
        ('Sirdaryo', 'Sirdaryo', 5000, 1500),
        ('Qoraqalpog''iston', 'Qoraqalpog''iston', 5000, 1500),
        ('Toshkent viloyati', 'Toshkent viloyati', 6000, 1700)
      ON CONFLICT DO NOTHING
    `);

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        driver_id UUID,
        type VARCHAR(50),
        title VARCHAR(200),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Migration muvaffaqiyatli bajarildi!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration xatosi:', err);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
