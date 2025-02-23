# TransitPlus 🚃

![transitplus](public/transitplus.png)

TransitPlus adalah aplikasi berbasis web yang dirancang untuk memberikan pengalaman transportasi umum yang lebih interaktif dan menarik melalui fitur pengumpulan poin dan penukaran reward. Dengan TransitPlus, pengguna dapat mengumpulkan poin dari perjalanan menggunakan transportasi umum dan menukarkannya dengan berbagai hadiah menarik dari mitra yang bekerja sama. Aplikasi ini bertujuan untuk meningkatkan minat masyarakat dalam menggunakan transportasi umum serta mendukung gaya hidup yang lebih ramah lingkungan.

### Live Website

[TransitPlus Live](https://transitplus.rey.mba/)

---

## Tech Stack

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-%232596BE.svg?style=for-the-badge&logo=tRPC&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

1. Next.js
2. Tailwind CSS
3. Auth.js + Google OAuth
4. PostgreSQL Database
5. tRPC + TanStack Query (React Query)
6. Prisma ORM

## Table of Contents

1. [Installation](#installation)
2. [Environment Setup](#environment-setup)
3. [Usage](#usage)
4. [Features](#features)

---

## Installation

### Prerequisites

- Node.js/Bun/pnpm sudah terinstall di sistem Anda.
- Mengerti cara menggunakan terminal atau command prompt.

### Steps

1. **Clone Repository:**

   ```bash
   git clone https://github.com/reynaldomarchell/interium-hack.git
   ```

2. **Install Dependencies:**

   Gunakan package manager pilihan Anda (sebaiknya bun):

   - Menggunakan bun:

     ```bash
     bun install
     ```

3. **Setup Database dengan Prisma:**

   Lakukan migrasi database menggunakan Prisma:

   ```bash
   bunx prisma db push
   ```

4. **Start Development Server:**

   Jalankan server pengembangan:

   ```bash
   bun dev
   ```

5. **Access Application:**

   Buka URL berikut di browser: [http://localhost:3000/](http://localhost:3000/)

## Environment Setup

Pastikan Anda memiliki file `.env` yang benar dengan variabel yang dibutuhkan. Jika belum ada, buat dan isi sesuai dengan kebutuhan aplikasi, contohnya:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/interium-hack"

NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

OPENAI_KEY=""
```

## Usage

1. **Landing Page:**

   Setelah membuka aplikasi, Anda akan diarahkan ke halaman utama yang menjelaskan tentang TransitPlus dan cara kerjanya.

2. **Login:**

   Untuk mengakses fitur lengkap, login diperlukan. Anda bisa melakukan login menggunakan akun Google.

3. **Signup:**

   Jika anda belum mempunyai akun, maka bisa membuat akun terlebih dahulu.

4. **/profile**

   - Berisi history penggunaan transportasi dan personal information.
   - Daftar perjalanan yang telah dilakukan

5. **/events**

   - Akses melalui Sidebar --> Events.
   - Berisi informasi mengenai acara atau inisiatif komunitas yang berkaitan dengan penggunaan transportasi umum.

6. **/points**

   - Akses melalui Sidebar --> TravelPoints.
   - Pilih reward yang tersedia berdasarkan poin yang dimiliki dan tukarkan langsung dari aplikasi.
   - Berisi poin yang diperoleh dari setiap perjalanan.

## Features

- **Poin Perjalanan:** Mengumpulkan poin dari setiap penggunaan transportasi umum.
- **Penukaran Reward:** Menukarkan poin dengan berbagai hadiah dari mitra TransitPlus.
- **Riwayat Perjalanan:** Melihat daftar perjalanan dan statistik penggunaan.
- **Login Integration:** Masuk dengan mudah menggunakan akun Google.
- **Community Events:** Berpartisipasi dalam acara atau komunitas untuk mendukung penggunaan transportasi umum.

## Contributors

<a href="https://github.com/reynaldomarchell/interium-hack/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=reynaldomarchell/interium-hack"/>
</a>
