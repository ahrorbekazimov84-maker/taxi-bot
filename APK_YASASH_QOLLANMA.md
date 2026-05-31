# 📱 APK Yasash — To'liq Qo'llanma (EAS Build)

## Talab qilinadigan dasturlar

| Dastur | Yuklab olish |
|--------|-------------|
| Node.js 18+ | https://nodejs.org |
| Git | https://git-scm.com |
| VSCode | https://code.visualstudio.com |

---

## 1️⃣ Expo hisobi yarating (BEPUL)

1. **https://expo.dev** saytiga o'ting
2. **"Sign Up"** → email va parol bilan ro'yxatdan o'ting
3. Email tasdiqlang

---

## 2️⃣ EAS CLI o'rnating

Terminal oching va yozing:

```bash
npm install -g eas-cli
```

Hisobga kiring:
```bash
eas login
# Email va parolni kiriting
```

---

## 3️⃣ Driver App APK yasash

```bash
# 1. Papkaga kiring
cd taxi-app/driver-app

# 2. Kutubxonalarni o'rnating
npm install

# 3. Expo project yarating (birinchi marta)
eas init
# "Create a new project" tanlang
# Nom: taxi-driver-app

# 4. APK build boshlang
eas build --platform android --profile preview
```

**Savollarga javoblar:**
- `Generate a new Android Keystore?` → **Y** (Enter)
- Boshqa savollar → Enter (default)

⏳ Build 5-15 daqiqa davom etadi (bulutda)

---

## 4️⃣ Passenger App APK yasash

```bash
# Yangi terminal
cd taxi-app/passenger-app

npm install

eas init
# Nom: taxigo-passenger

eas build --platform android --profile preview
```

---

## 5️⃣ APK yuklab olish

Build tugagandan so'ng:

```
✅ Build finished!
🤖 Android APK: https://expo.dev/artifacts/eas/...
```

1. Havolani brauzerda oching
2. **"Download"** tugmasini bosing
3. `.apk` fayl yuklanadi

Yoki **https://expo.dev** → **Projects** → **Builds** → Download

---

## 6️⃣ Telefoningizga o'rnatish

**Usul 1 — USB orqali:**
1. APK faylni telefonga ko'chiring (USB yoki Telegram)
2. Telefonda APK ga bosing
3. `"Noma'lum manbadan o'rnatish"` → **Ruxsat berish**
4. **O'rnatish**

**Usul 2 — To'g'ridan-to'g'ri:**
- Build tugagach Expo sizga QR kod beradi
- Telefoningizda QR kodni skaner qiling → APK yuklanadi

---

## ⚠️ Muhim: API manzilini o'zgartiring

APK yasashdan OLDIN, real server IP manzilini yozing:

**`driver-app/src/utils/api.js`** va **`passenger-app/src/utils/api.js`** fayllarini oching:

```js
// BU QATORNI O'ZGARTIRING:
export const API_URL = 'http://YOUR_SERVER_IP:5000/api';

// MASALAN (serveringiz IP si):
export const API_URL = 'http://185.74.22.15:5000/api';

// Agar lokal test uchun (telefon va kompyuter bir WiFi da):
export const API_URL = 'http://192.168.1.5:5000/api';
```

---

## 🔄 Keyingi yangilanishda

Kodni o'zgartirganda yangi APK yasash:

```bash
# app.json da versionCode ni +1 qiling
# "versionCode": 2

eas build --platform android --profile preview
```

---

## 🏪 Play Store ga chiqarish (ixtiyoriy)

```bash
# AAB format (Play Store uchun)
eas build --platform android --profile production

# Play Store ga yuborish
eas submit --platform android
```

---

## ❓ Muammolar

| Xato | Yechim |
|------|--------|
| `eas: command not found` | `npm install -g eas-cli` qayta bajaring |
| `Not logged in` | `eas login` bilan kiring |
| Build failed - keystore | `eas credentials` bilan qayta yarating |
| APK o'rnatilmaydi | Telefoningizda "Noma'lum manbalar" ni yoqing |
| Server ulanmaydi | API_URL dagi IP manzilni tekshiring |

---

## 📞 Yordam

Muammo chiqsa — xato xabarini shu chatga yuboring, yordam beraman!
