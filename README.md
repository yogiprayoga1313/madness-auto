# Madness Finance Auto Bot

Bot otomatis untuk Madness Finance yang melakukan:
1. Auto check-in harian
2. Auto swap MON ke MAD
3. Auto update progress on chain

## Fitur

- ✅ Auto check-in harian
- ✅ Auto swap MON ke MAD
- ✅ Auto update progress on chain
- ✅ Notifikasi status check-in sebelumnya
- ✅ Error handling yang informatif

## Persyaratan

- Node.js v18 atau lebih tinggi
- Private key wallet Monad
- Sedikit MON untuk gas fee

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/username/madness-auto.git
cd madness-auto
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` dan masukkan private key Anda:
```bash
PRIVATE_KEY=your_private_key_here
```

## Penggunaan

1. Pastikan Anda memiliki:
   - Private key di file `.env`
   - Sedikit MON untuk gas fee

2. Jalankan bot:
```bash
node index.js
```

Bot akan:
1. Connect ke wallet
2. Check-in harian
3. Swap MON ke MAD
4. Update progress on chain

## Catatan

- Bot akan menampilkan status setiap langkah
- Jika sudah check-in hari ini, bot akan memberitahu
- Pastikan memiliki cukup MON untuk gas fee
- Private key disimpan di file `.env` untuk keamanan

## Kontribusi

Silakan buat pull request untuk kontribusi. Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

## Lisensi

MIT 