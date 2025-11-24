# SpeedTest Indo

Aplikasi web modern untuk menguji kecepatan internet secara real-time (Download, Upload, Ping, Jitter) dengan antarmuka yang responsif dan futuristik.

![SpeedTest Indo Preview](public/gauge-speed.png)

## 🚀 Fitur Utama

- **Real-Time Speed Measurement**: Pengukuran akurat menggunakan *multi-stream parallel connections* untuk Download dan Upload.
- **Custom Speed Gauge**: Visualisasi speedometer kustom dengan animasi 60fps (menggunakan `requestAnimationFrame` interpolation) yang mulus.
- **Responsive Design**: Tampilan optimal di Desktop maupun Mobile, dengan layout adaptif dan font *Plus Jakarta Sans*.
- **Modern UI**: Tema warna *Cyan & Slate* (Dark Mode), animasi transisi halus, dan tipografi yang jelas.
- **Accurate Ping**: Endpoint khusus (`/api/test/ping`) tanpa delay untuk pengukuran latensi minimal.
- **Start Button Overlay**: Tombol mulai yang interaktif dan terintegrasi dengan gauge.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Plus Jakarta Sans

## 📦 Cara Menjalankan (Lokal)

1. **Clone Repository**:
   ```bash
   git clone https://github.com/YsrnDev/speedtest.git
   cd speedtest
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   npm start
   ```

## 🐳 Cara Menjalankan (Docker)

Aplikasi ini sudah dilengkapi dengan konfigurasi **Docker** (Standalone Output) untuk deployment yang mudah dan ringan.

### Menggunakan Docker Compose (Recommended)

Pastikan Docker dan Docker Compose sudah terinstall.

1. **Build & Run**:
   ```bash
   docker-compose up -d --build
   ```

2. **Akses Aplikasi**:
   Buka browser dan akses `http://localhost:3000` (atau IP VPS Anda).

3. **Stop Aplikasi**:
   ```bash
   docker-compose down
   ```

## ☁️ Deployment ke VPS

1. Push kode ke repository Git Anda.
2. SSH ke VPS Anda.
3. Clone repository di VPS.
4. Jalankan perintah `docker-compose up -d --build`.
5. (Opsional) Gunakan Nginx sebagai reverse proxy jika ingin menggunakan domain dan HTTPS.

## 📝 Lisensi

Project ini dibuat untuk tujuan edukasi dan portofolio.
