# Deskripsi Proyek: CogniFlow - Platform Pembelajaran Adaptif VARK + ADHD

Dokumen ini memberikan gambaran umum yang komprehensif untuk proyek aplikasi web "Citta", sebuah platform pembelajaran yang dirancang khusus untuk mengakomodasi gaya belajar Visual, Auditory, Reading/Writing, dan Kinesthetic (VARK), serta menyediakan dukungan bagi pengguna dengan ADHD.

---

## 1. Ringkasan & Visi Proyek

### 1.1 Visi
Menciptakan platform pembelajaran yang benar-benar personal dan adaptif, di mana setiap individu, terutama yang memiliki preferensi belajar spesifik (VARK) atau tantangan atensi (ADHD), dapat menguasai konsep baru dengan cara yang paling efektif dan menarik bagi mereka.

### 1.2 Masalah yang Diselesaikan
Platform e-learning konvensional seringkali menerapkan pendekatan "satu untuk semua", menyajikan materi secara monoton (biasanya teks dan gambar statis). Pendekatan ini gagal melayani:
1.  *Pelajar dengan Gaya Belajar Berbeda:* Pelajar Kinestetik dan Auditori seringkali terpinggirkan dalam format yang didominasi Teks/Visual.
2.  *Pelajar Neurodivergen:* Pengguna dengan ADHD mungkin kesulitan untuk tetap fokus pada blok teks yang panjang dan antarmuka yang tidak terstruktur.
CogniFlow mengatasi ini dengan menawarkan mode interaksi yang beragam dan sistem cerdas yang dapat merekomendasikan mode belajar paling efektif untuk setiap pengguna.

---

## 2. Target Pengguna & Skenario

### 2.1 Target Pengguna
*   *Pelajar & Mahasiswa:* Terutama mereka yang sadar akan gaya belajar mereka (VARK) atau mencari metode belajar alternatif yang lebih menarik.
*   *Individu dengan ADHD:* Pengguna yang membutuhkan alat bantu belajar dengan fitur seperti bionic reading, pemecahan materi, dan penyesuaian visual untuk membantu fokus.
*   *Pendidik & Tutor:* Profesional yang ingin menyediakan materi pembelajaran yang terdiferensiasi untuk menjangkau semua jenis pelajar.

### 2.2 Skenario Pengguna Utama
*   *Skenario Kinestetik (K):* Seorang siswa biologi mempelajari anatomi jantung. CogniFlow menyajikan diagram jantung dan beberapa label (misal: "Ventrikel Kiri", "Aorta"). Siswa harus *menyeret (drag)* setiap label ke lokasi yang benar pada diagram. Backend kemudian memvalidasi posisi jawaban tersebut.
*   *Skenario ADHD:* Seorang developer membaca dokumentasi teknis yang padat. Ia mengaktifkan mode *"Bionic Reading"* dan *"Chunking"*. CogniFlow secara otomatis memformat teks, menebalkan beberapa huruf awal di setiap kata dan memecah paragraf panjang menjadi poin-poin singkat, membuatnya lebih mudah dicerna.
*   *Skenario Auditori (A):* Seorang pengguna lebih suka mendengarkan penjelasan. Ia memulai percakapan dengan *AI Voice Agent*, berdiskusi tentang konsep "Inflasi Ekonomi" seolah-olah berbicara dengan tutor pribadi.
*   *Skenario Adaptif:* Seorang pengguna memulai dalam mode Baca/Tulis (R/W) untuk memahami "Fotosintesis". Setelah beberapa kali merespons dengan "kurang paham" atau "bisa ulangi?", sistem mendeteksi ketidakefisienan. Berdasarkan data historis pengguna yang menunjukkan ia lebih berhasil dalam mode Visual, LLM akan menyarankan: "Sepertinya penjelasan teks ini kurang efektif. Maukah Anda saya tunjukkan dalam bentuk diagram visual di kanvas?" Konteks percakapan langsung ditransfer ke mode Visual.

---

## 3. Konsep Inti & Alur Kerja

### 3.1 Konsep Inti: "Mesin Pembelajaran Adaptif" (Adaptive Learning Engine)
Inti dari CogniFlow adalah mesin cerdas yang mempersonalisasi pengalaman belajar. Mesin ini bekerja di atas empat mode interaksi utama (V, A, R, K).

*Cara Kerja:*
1.  *Pelacakan Interaksi:* Untuk setiap interaksi pengguna dalam setiap mode (V, A, R, K), sistem mencatat:
    *   countResponse: Jumlah total interaksi/respons dari AI.
    *   countNegativeResponse: Jumlah respons pengguna yang mengindikasikan kebingungan atau ketidakpahaman (misalnya: "hmm", "kurang jelas", "saya tidak mengerti", "ulangi lagi").
2.  *Analisis Performa:* Sistem terus menghitung rasio pemahaman (negativeResponse / totalResponse) untuk setiap mode.
3.  *Rekomendasi Cerdas:* Jika rasio pemahaman pengguna dalam mode saat ini menurun (menunjukkan kesulitan), dan data historis menunjukkan performa yang jauh lebih baik di mode lain, LLM akan secara proaktif menawarkan untuk beralih ke mode yang lebih efektif tersebut.
4.  *Transfer Konteks:* Saat beralih mode, seluruh konteks percakapan (topik, pertanyaan terakhir, dokumen yang diunggah) dibawa serta, memastikan kelanjutan pembelajaran yang mulus.

---

## 4. Rincian Fitur Utama

### 4.1 Mode Pembelajaran VARK

*   *1. Visual (V): Kanvas Generatif*
    *   AI menggambar diagram, alur proses, dan konsep visual lainnya secara real-time di atas kanvas digital sebagai respons terhadap prompt pengguna.

*   *2. Auditory (A): AI Voice Agent*
    *   Pengguna dapat berinteraksi melalui percakapan suara dua arah dengan AI. Fitur ini mencakup Text-to-Speech (TTS) dan Speech-to-Text (STT) untuk pengalaman dialog yang natural.

*   *3. Reading/Writing (R/W): Interaksi Teks Standar*
    *   Antarmuka chat konvensional untuk pengguna yang lebih suka membaca penjelasan dan mengetik pertanyaan. Ini adalah mode dasar.

*   *4. Kinesthetic (K): Kanvas Interaktif*
    *   Mode khusus untuk aktivitas langsung. LLM dapat menghasilkan soal interaktif.
    *   *Elemen Draggable:* LLM menyediakan daftar elemen/jawaban yang dapat diseret dan koordinat (x, y) yang benar untuk setiap elemen di kanvas.
    *   *Validasi Backend:* Ketika pengguna melepaskan (drop) sebuah elemen, frontend mengirimkan koordinatnya ke backend. Backend memverifikasi apakah posisi tersebut berada dalam rentang toleransi (offset) dari koordinat yang benar.

### 4.2 Suite Dukungan ADHD

*   *Bionic Reading:* Sebuah toggle di pengaturan yang akan memformat semua teks respons dari AI dengan menebalkan huruf-huruf awal setiap kata untuk memandu mata dan meningkatkan kecepatan membaca.
*   *Chunking & Breaking Down Text:* Opsi bagi pengguna untuk meminta AI agar selalu memecah penjelasan panjang menjadi beberapa pesan singkat, poin-poin, atau langkah-langkah bernomor.
*   *Font and Spacing Adjustments:* Di halaman pengaturan, pengguna dapat menyesuaikan:
    *   Ukuran font.
    *   Jenis font (termasuk opsi font yang ramah disleksia seperti OpenDyslexic).
    *   Jarak antar baris dan paragraf.

### 4.3 Fitur Lainnya
*   *AI Speak & Generative Canvas:* Fungsionalitas Generative Canvas dengan react konva
*   *Manajemen Sesi:* Semua sesi (termasuk data performa VARK) disimpan dan dapat diakses kembali.

---

## 5. Arsitektur Backend & API

Arsitektur dasar (Node.js, Express, MongoDB, Socket.IO) dipertahankan, dengan penambahan tanggung jawab berikut:

### 5.1 Tanggung Jawab Tambahan
*   *Pelacakan Performa Pengguna:*
    *   Membuat skema database baru untuk menyimpan data countResponse dan countNegativeResponse per pengguna untuk setiap mode VARK.
    *   Membuat endpoint atau event WebSocket (track_interaction) untuk menerima data ini dari frontend.
*   *Validasi Jawaban Kinestetik:*
    *   Membuat endpoint REST API baru, misal: POST /api/v1/interactions/validate-kinesthetic.
    *   Endpoint ini menerima elementId dan coordinates dari frontend, lalu membandingkannya dengan data yang benar dari LLM dengan memperhitungkan offset yang diizinkan.
*   *Orkestrasi LLM yang Ditingkatkan:*
    *   LLM harus di-prompt tidak hanya untuk menjawab pertanyaan, tetapi juga untuk:
        1.  Mengidentifikasi negativeResponse dari input pengguna.
        2.  Memutuskan kapan harus menawarkan pergantian mode belajar.
        3.  Menghasilkan konten untuk mode Kinestetik (elemen draggable dan koordinatnya).

### 5.2 Desain API & WebSocket (Contoh Penambahan)
*   *REST API Endpoints:*
    *   POST /api/v1/interactions/validate-kinesthetic: Memvalidasi jawaban di kanvas interaktif.
*   *WebSocket Events:*
    *   *Client -> Server:*
        *   track_interaction (data): Mengirim data setiap kali interaksi selesai. data berisi { mode: 'V' | 'A' | 'R' | 'K', isNegative: boolean }.
        *   submit_kinesthetic_answer (data): Mengirim jawaban dari mode kinestetik.
    *   *Server -> Client:*
        *   mode_suggestion (data): Mengirim penawaran untuk beralih mode. data berisi { suggestedMode: 'V' | 'A' | 'R' | 'K', message: '...' }.

---

## 6. Tumpukan Teknologi & Prinsip Desain

*   *Tumpukan Teknologi:* React, Node.js, TypeScript, Tailwind CSS, MongoDB, Docker
*   *Prinsip Desain:*
    *   *Aksesibilitas sebagai Prioritas:* Desain antarmuka harus sangat mudah diakses, dengan kontras warna yang baik dan navigasi yang jelas.
    *   *Kustomisasi Pengguna:* Memberikan pengguna kontrol penuh atas tampilan dan nuansa antarmuka (fitur ADHD).
    *   *Minimalisme:* Menghindari kekacauan visual untuk membantu pengguna tetap fokus pada materi pembelajaran.