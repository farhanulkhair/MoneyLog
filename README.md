# 🟩 MoneyLog - Aplikasi Pencatatan Keuangan Modern

MoneyLog adalah aplikasi pencatatan keuangan pribadi dan sosial yang dirancang dengan antarmuka modern, bersih, dan berkinerja tinggi. Aplikasi ini membantu Anda memantau pengeluaran pribadi secara mendalam, melacak hutang-piutang teman, hingga membagi tagihan makan/belanja secara adil dan cepat.

---

## ✨ Fitur Utama

### 1. 📊 Dashboard Keuangan Modern & Interaktif
- **Ringkasan Finansial Dinamis**: Kartu saldo utama menampilkan total pengeluaran yang secara otomatis menyesuaikan dengan periode waktu terpilih (Hari, Minggu, Bulan, atau Periode Kustom).
- **Sub-Kartu Pemasukan & Pengeluaran**: Menampilkan pemasukan bulan ini dan pengeluaran hari ini secara instan dengan indikator tren warna yang intuitif.
- **Visualisasi Bulat Penuh (Pie Chart)**: Visualisasi distribusi pengeluaran berbasis kategori dalam bentuk solid Pie Chart dengan label persentase dinamis pada masing-masing irisan. Ketuk irisan untuk langsung filter transaksi!

### 2. 📝 Sistem Pencatatan Hutang
- **Manajemen Berbasis Kontak**: Kelompokkan catatan hutang berdasarkan nama teman atau keluarga. Nama orang tidak akan terhapus otomatis setelah lunas demi kemudahan pencatatan berikutnya.
- **Metode Pelunasan Fleksibel**: Checklist per item hutang atau gunakan tombol **"Lunasi Semua"** untuk melunasi seluruh hutang aktif sekaligus.
- **Riwayat Lengkap**: Tab terpisah antara hutang aktif dan riwayat hutang lunas untuk transparansi catatan.

### 3. 👥 Split Bill (Bagi Tagihan) Pintar
- **Langkah Pembuatan Wizard (5 Step)**:
  1. *Informasi Transaksi*: Judul belanja/nama tempat makan.
  2. *Daftar Menu & Pajak*: Masukkan porsi (Qty), nama menu, harga total, dan opsi PPN/Tax restoran secara otomatis.
  3. *Input Peserta*: Tambahkan daftar nama teman yang ikut patungan.
  4. *Hubungkan Menu*: Ketuk nama orang pada menu yang dipesan, sistem akan membagi harga menu tersebut secara proposional dan adil.
  5. *Rincian & Pembagian*: Hasil kalkulasi pembagian akhir yang mendetail per orang.
- **Metode Berbagi Cepat**:
  - **Salin Teks Struk**: Format pesan teks rapi siap pakai untuk di-paste ke media sosial.
  - **Kirim ke WhatsApp**: Deep-link langsung untuk mengirim rincian tagihan ke kontak/grup WhatsApp.
  - **Ekspor PDF Struk**: Cetak laporan struk bagi tagihan dalam format PDF yang siap dibagikan.

### 4. 🔒 Keamanan & Personalisasi Akun
- **Autentikasi Aman**: Integrasi penuh menggunakan Supabase Auth (Email & Password / Google OAuth).
- **Edit Profil Terproteksi**: Demi integritas data akun, pengguna hanya diizinkan untuk mengubah nama lengkap (*Full Name*) secara instan. Data sensitif seperti email, tanggal bergabung, dan keamanan lainnya dilindungi dan berstatus *read-only* dengan indikator kunci pengaman.

---

## 🛠️ Teknologi yang Digunakan

- **Core Framework**: [Next.js 16 (Turbopack)](https://nextjs.org) dengan React 19 & TypeScript.
- **Styling**: Vanilla CSS / TailwindCSS untuk visualisasi responsif dan estetika premium (Glassmorphism & Micro-animations).
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Realtime, & Edge Functions).
- **Grafik**: [Recharts](https://recharts.org) untuk performa visualisasi data yang responsif dan interaktif.
- **Library PDF**: Generator PDF kustom untuk ekspor laporan keuangan dan struk split bill.

---

## 🚀 Memulai Aplikasi (Local Development)

### 1. Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org) (v18 ke atas) di perangkat Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/farhanulkhair/MoneyLog.git
cd MoneyLog
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env.local`)
Buat berkas `.env.local` di direktori utama proyek dan isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## 📦 Pembangunan Produksi (Build)
Untuk memvalidasi kesiapan kode dan membuat bundel produksi yang dioptimalkan:
```bash
npm run build
npm run start
```
