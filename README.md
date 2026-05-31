# 🚕 Viloyatlar Aro Taxi — To'liq Loyiha

## Loyiha tuzilmasi

```
taxi-app/
├── backend/          ← Node.js + Express + PostgreSQL + Socket.IO
├── crm/              ← React web (Operator panel)
├── driver-app/       ← React Native (Haydovchi ilovasi)
└── passenger-app/    ← React Native (Yo'lovchi ilovasi)
```

---

## 1️⃣ Backend ishga tushirish

### Talablar
- Node.js 18+
- PostgreSQL 14+

### O'rnatish

```bash
cd backend
npm install
cp .env.example .env
# .env faylini oching va ma'lumotlarni to'ldiring
```

### PostgreSQL sozlash

```sql
-- psql da:
CREATE DATABASE taxi_db;
```

### Migratsiya (jadvallar yaratish)

```bash
npm run migrate
```

### Ishga tushirish

```bash
npm run dev      # development
npm start        # production
```

Server: `http://localhost:5000`  
API: `http://localhost:5000/api`

---

## 2️⃣ CRM (Operator panel) ishga tushirish

```bash
cd crm
npm install
npm start
```

Brauzer: `http://localhost:3000`

**Login:** `admin` / `admin123`

---

## 3️⃣ Mobil ilovalar (Driver & Passenger)

### Talablar
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android Studio yoki iOS Simulator

### Driver App

```bash
cd driver-app
npm install
# src/utils/api.js da API_URL ni o'zgartiring:
# 'http://YOUR_SERVER_IP:5000/api'
# (localhost emas! telefoningizning IP manzilingiz kerak)
npx expo start
```

### Passenger App

```bash
cd passenger-app
npm install
# src/utils/api.js da API_URL ni o'zgartiring
npx expo start
```

---

## 🔌 API endpointlar

### Auth
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/auth/passenger/register | Yo'lovchi ro'yxati |
| POST | /api/auth/passenger/login | Yo'lovchi kirish |
| POST | /api/auth/driver/register | Haydovchi ro'yxati |
| POST | /api/auth/driver/login | Haydovchi kirish |
| POST | /api/auth/admin/login | Admin kirish |

### Triplar
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/trips | Yangi trip yaratish |
| POST | /api/trips/:id/accept | Qabul qilish |
| POST | /api/trips/:id/start | Boshlash |
| POST | /api/trips/:id/complete | Yakunlash |
| POST | /api/trips/:id/cancel | Bekor qilish |
| POST | /api/trips/:id/rate | Baholash |
| GET | /api/trips/my | Mening triplarim |
| GET | /api/trips | Barchasi (admin) |

### Haydovchilar (admin)
| Method | URL | Tavsif |
|--------|-----|--------|
| GET | /api/drivers | Ro'yxat |
| PUT | /api/drivers/:id/verify | Tasdiqlash |
| GET | /api/admin/dashboard | Statistika |

---

## ⚡ Socket.IO hodisalar

### Haydovchi tinglaydigan
- `new_trip_request` — yangi buyurtma keldi
- `trip_cancelled` — yo'lovchi bekor qildi

### Yo'lovchi tinglaydigan
- `trip_accepted` — haydovchi qabul qildi
- `trip_started` — safar boshlandi
- `trip_completed` — safar yakunlandi
- `driver_location` — haydovchi koordinatasi
- `trip_cancelled` — haydovchi bekor qildi

---

## 🛠 Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Backend | Node.js, Express, PostgreSQL, Socket.IO |
| CRM | React 18, Recharts, React Router |
| Mobile | React Native, Expo, Socket.IO Client |
| Auth | JWT + bcrypt |

---

## 📝 Eslatmalar

1. **API_URL** — mobil ilovalardagi `src/utils/api.js` da kompyuteringizning **lokal IP manzili** bo'lishi kerak (masalan `192.168.1.10`), `localhost` emas.

2. **Google Maps** — haqiqiy loyihada `react-native-maps` uchun Google Maps API key kerak bo'ladi.

3. **SMS tasdiqlash** — haqiqiy loyihada `Eskiz.uz` yoki `Play Mobile` SMS API qo'shiladi.

4. **Admin parol** — `backend/src/controllers/authController.js` da `loginAdmin` funksiyasida haqiqiy hash bilan almashtirilsin.
