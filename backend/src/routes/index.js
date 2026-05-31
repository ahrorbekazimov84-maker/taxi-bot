const router = require('express').Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const auth = require('../controllers/authController');
const trip = require('../controllers/tripController');
const driver = require('../controllers/driverController');

// ── AUTH ────────────────────────────────────────────────────
router.post('/auth/passenger/register', auth.registerPassenger);
router.post('/auth/passenger/login', auth.loginPassenger);
router.post('/auth/driver/register', auth.registerDriver);
router.post('/auth/driver/login', auth.loginDriver);
router.post('/auth/admin/login', auth.loginAdmin);

// ── TRIPS ───────────────────────────────────────────────────
router.post('/trips', authMiddleware, trip.createTrip);
router.post('/trips/:trip_id/accept', authMiddleware, trip.acceptTrip);
router.post('/trips/:trip_id/start', authMiddleware, trip.startTrip);
router.post('/trips/:trip_id/complete', authMiddleware, trip.completeTrip);
router.post('/trips/:trip_id/cancel', authMiddleware, trip.cancelTrip);
router.post('/trips/:trip_id/rate', authMiddleware, trip.rateTrip);
router.get('/trips/my', authMiddleware, trip.getMyTrips);
router.get('/trips', authMiddleware, adminMiddleware, trip.getAllTrips);

// ── DRIVERS ─────────────────────────────────────────────────
router.get('/drivers', authMiddleware, adminMiddleware, driver.getAllDrivers);
router.get('/drivers/me', authMiddleware, driver.getDriverProfile);
router.get('/drivers/me/stats', authMiddleware, driver.getDriverStats);
router.put('/drivers/location', authMiddleware, driver.updateLocation);
router.put('/drivers/toggle-online', authMiddleware, driver.toggleOnline);
router.get('/drivers/:id', authMiddleware, adminMiddleware, driver.getDriverProfile);
router.put('/drivers/:id/verify', authMiddleware, adminMiddleware, driver.verifyDriver);
router.get('/drivers/:id/stats', authMiddleware, adminMiddleware, driver.getDriverStats);

// ── ADMIN DASHBOARD ─────────────────────────────────────────
router.get('/admin/dashboard', authMiddleware, adminMiddleware, driver.getDashboardStats);

module.exports = router;
