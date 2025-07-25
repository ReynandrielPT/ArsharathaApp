# Rencana Implementasi Backend: CogniFlow (dengan Firebase Auth)

Dokumen ini menguraikan langkah-langkah teknis untuk mengimplementasikan fungsionalitas backend untuk platform CogniFlow, mengintegrasikan Firebase Authentication seperti yang didefinisikan dalam `PRD.md` dan `draft.txt`.

---

## Fase 1: Fondasi Model Data & Otentikasi

Tujuan dari fase ini adalah untuk menyelaraskan model data dan alur otentikasi dengan Firebase.

### 1.1. Modifikasi `models/User.ts`
Menyesuaikan model `User` untuk menyimpan data dari Firebase dan preferensi aplikasi. `uid` dari Firebase akan menjadi kunci utama.

```typescript
// C:/Users/Khalfani Shaquille/Documents/GitHub/ArsharathaApp/backend/src/models/User.ts

import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string; // Firebase User ID
  email: string;
  fullName: string;
  settings: {
    bionicReading: boolean;
    font: 'default' | 'OpenDyslexic';
    spacing: 'default' | 'medium' | 'large';
    chunking: boolean;
  };
}

const userSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  settings: {
    bionicReading: { type: Boolean, default: false },
    font: { type: String, enum: ['default', 'OpenDyslexic'], default: 'default' },
    spacing: { type: String, enum: ['default', 'medium', 'large'], default: 'default' },
    chunking: { type: Boolean, default: false },
  },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);
```

### 1.2. Buat Middleware Otentikasi Firebase (`middleware/firebaseAuth.ts`)
Middleware ini akan menggantikan `auth.ts` yang lama. Tugasnya adalah memverifikasi token ID Firebase yang dikirim dari frontend.

```typescript
// C:/Users/Khalfani Shaquille/Documents/GitHub/ArsharathaApp/backend/src/middleware/firebaseAuth.ts (File Baru)

import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

// Inisialisasi Firebase Admin SDK (lakukan sekali di file utama server)
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

export interface IAuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const firebaseAuthMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};
```

### 1.3. Perbarui Rute Pengguna (`routes/user.ts`)
Rute ini sekarang akan menangani pembuatan dan pembaruan profil pengguna setelah registrasi di Firebase.

```typescript
// C:/Users/Khalfani Shaquille/Documents/GitHub/ArsharathaApp/backend/src/routes/user.ts

import { Router } from 'express';
import { User } from '../models/User';
import { firebaseAuthMiddleware, IAuthRequest } from '../middleware/firebaseAuth';

const router = Router();

// Endpoint untuk membuat profil pengguna baru setelah registrasi Firebase
router.post('/', async (req, res) => {
  const { uid, email, fullName } = req.body;
  try {
    const newUser = new User({ uid, email, fullName });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create user profile.' });
  }
});

// Gunakan middleware untuk semua rute di bawah ini
router.use(firebaseAuthMiddleware);

// Endpoint untuk mendapatkan profil pengguna yang sudah login
router.get('/profile', async (req: IAuthRequest, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Endpoint untuk memperbarui pengaturan pengguna
router.put('/settings', async (req: IAuthRequest, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { $set: { settings: req.body } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user.settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
```


### 1.2. Buat Model Baru: `models/UserPerformance.ts`
Buat skema baru untuk melacak performa pengguna di setiap mode VARK. Ini akan menjadi koleksi terpisah untuk efisiensi pembaruan.

```typescript
// C:/Users/Khalfani Shaquille/Documents/GitHub/ArsharathaApp/backend/src/models/UserPerformance.ts (File Baru)

import mongoose, { Document, Schema } from 'mongoose';

interface IVarkPerformance {
  countResponse: number;
  countNegativeResponse: number;
}

export interface IUserPerformance extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  visual: IVarkPerformance;
  auditory: IVarkPerformance;
  reading: IVarkPerformance;
  kinesthetic: IVarkPerformance;
}

const VarkPerformanceSchema = new Schema({
  countResponse: { type: Number, default: 0 },
  countNegativeResponse: { type: Number, default: 0 },
}, { _id: false });

const UserPerformanceSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  visual: { type: VarkPerformanceSchema, default: () => ({}) },
  auditory: { type: VarkPerformanceSchema, default: () => ({}) },
  reading: { type: VarkPerformanceSchema, default: () => ({}) },
  kinesthetic: { type: VarkPerformanceSchema, default: () => ({}) },
});

export const UserPerformance = mongoose.model<IUserPerformance>('UserPerformance', UserPerformanceSchema);
```

### 1.3. Modifikasi `models/Session.ts`
Tambahkan field untuk melacak mode aktif saat ini dan menyimpan data untuk interaksi kinestetik.

```typescript
// C:/Users/Khalfani Shaquille/Documents/GitHub/ArsharathaApp/backend/src/models/Session.ts

export interface ISession extends Document {
  // ... (field yang ada)
  currentMode: 'V' | 'A' | 'R' | 'K';
  kinestheticData?: {
    elements: { id: string; text: string }[];
    dropZones: { elementId: string; x: number; y: number; tolerance: number }[];
  };
}

const sessionSchema = new Schema({
  // ... (field yang ada)
  currentMode: { type: String, enum: ['V', 'A', 'R', 'K'], default: 'R' },
  kinestheticData: { type: Schema.Types.Mixed },
}, { timestamps: true });
```

---

## Fase 2: Logika Inti & Orkestrasi LLM

Fase ini berfokus pada implementasi "Adaptive Learning Engine" dan memperbarui logika LLM.

### 2.1. Buat Layanan Baru: `services/learningService.ts`
Ini akan menjadi pusat orkestrasi untuk sesi pembelajaran, menggantikan logika yang lebih spesifik seperti `quizService`.

*   **Tanggung Jawab:**
    *   Memproses interaksi pengguna.
    *   Memanggil `UserPerformance` untuk memperbarui data pelacakan.
    *   Berinteraksi dengan `llm.ts` untuk menghasilkan respons.
    *   Menyimpan data kinestetik ke dalam model `Session`.

### 2.2. Rekayasa Ulang Prompt LLM (`llm.ts`)
Modifikasi `createPrompt` (atau buat fungsi baru `createLearningPrompt`) untuk memasukkan logika adaptif.

*   **Input Baru:** Fungsi prompt harus menerima `userPerformanceData` dan `currentMode`.
*   **Instruksi Prompt Baru:**
    1.  **Identifikasi Respons Negatif:** "Analisis input pengguna terakhir. Jika mengandung frasa seperti 'tidak mengerti', 'kurang jelas', 'ulangi', 'hmm', atau sejenisnya, anggap ini sebagai respons negatif."
    2.  **Logika Peralihan Mode:** "Bandingkan rasio negatif/total untuk `currentMode` dengan mode lainnya di `userPerformanceData`. Jika performa di mode saat ini buruk dan ada mode lain yang secara historis jauh lebih baik, tawarkan untuk beralih mode dengan pesan yang ramah."
    3.  **Konten Kinestetik:** "Jika diminta untuk membuat aktivitas kinestetik, hasilkan JSON dengan perintah `createDraggable` dan `defineDropZone`. `defineDropZone` harus berisi koordinat (x, y) yang benar dan `elementId` yang sesuai."

*   **Perintah Kanvas Baru (untuk ditambahkan ke prompt):**
    *   `createDraggable`: Membuat elemen yang bisa diseret.
        *   `payload`: `{ "id": "<string>", "text": "Label Jawaban" }`
    *   `defineDropZone`: Menentukan area target yang benar untuk elemen.
        *   `payload`: `{ "elementId": "<string>", "x": <number>, "y": <number>, "tolerance": <number> }`

### 2.3. Implementasi Validasi Kinestetik
Di dalam `learningService.ts`, buat fungsi `validateKinestheticAnswer`.

*   **Logika:**
    1.  Menerima `sessionId`, `elementId`, dan `droppedCoordinates {x, y}`.
    2.  Mengambil `kinestheticData` dari dokumen `Session`.
    3.  Menemukan `dropZone` yang benar untuk `elementId`.
    4.  Menghitung jarak antara `droppedCoordinates` dan koordinat yang benar.
    5.  Jika jarak <= `tolerance`, kembalikan `{ "correct": true }`. Jika tidak, `{ "correct": false }`.

---

## Fase 3: Lapisan API & WebSocket

Mengekspos fungsionalitas baru ke frontend.

### 3.1. Buat Rute Baru: `routes/interactions.ts`
Buat file rute baru untuk menangani interaksi pembelajaran yang kompleks.

*   **Endpoint:** `POST /api/v1/interactions/validate-kinesthetic`
*   **Body:** `{ "sessionId": "...", "elementId": "...", "coordinates": { "x": 123, "y": 456 } }`
*   **Fungsi:** Memanggil `learningService.validateKinestheticAnswer` dan mengembalikan hasilnya.

### 3.2. Modifikasi Rute Pengguna: `routes/user.ts`
Tambahkan endpoint untuk mengelola pengaturan ADHD.

*   **Endpoint:** `PUT /api/user/settings`
*   **Body:** `{ "bionicReading": true, "font": "OpenDyslexic", ... }`
*   **Fungsi:** Memvalidasi dan memperbarui dokumen `User` yang sesuai.

### 3.3. Perbarui Logika WebSocket (`server.ts`)
Tambahkan event baru untuk komunikasi real-time.

*   **Client -> Server:**
    *   `track_interaction (data: { sessionId: string, mode: 'V'|'A'|'R'|'K', isNegative: boolean })`: Event ini dipanggil setiap kali AI merespons. Backend akan menggunakan ini untuk memperbarui `UserPerformance`.
*   **Server -> Client:**
    *   `mode_suggestion (data: { suggestedMode: 'V'|'A'|'R'|'K', message: string })`: Dikirim ketika LLM memutuskan untuk menawarkan pergantian mode. Frontend akan menampilkan prompt ini kepada pengguna.

---

## Fase 4: Integrasi & Penyesuaian

Menyatukan semua komponen dan melakukan penyesuaian.

1.  **Perbarui `server.ts`:** Impor dan gunakan rute `interactions.ts` yang baru. Integrasikan `learningService` ke dalam handler event `start_session` di Socket.IO, pastikan `UserPerformance` diambil dan diteruskan ke LLM pada setiap giliran.
2.  **Manajemen State:** Pastikan state sesi (terutama `kinestheticData`) dibersihkan atau diarsipkan dengan benar saat sesi berakhir atau topik berubah.
3.  **Pengujian & Iterasi Prompt:** Lakukan pengujian menyeluruh pada alur adaptif. Kemungkinan besar, prompt LLM untuk deteksi respons negatif dan penawaran pergantian mode akan memerlukan beberapa kali iterasi untuk mendapatkan hasil yang natural dan akurat.
