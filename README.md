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
- ✅ Support multiple accounts

## Persyaratan

- Node.js v18 atau lebih tinggi
- Private key wallet Monad
- Balance requirements per wallet:
  - Minimum 0.1 MON untuk swap
  - Minimum 0.02 MON untuk gas fee
  - Total minimum: 0.12 MON per wallet

## Setup

1. Clone repository:
```bash
git clone https://github.com/yogiprayoga1313/madness-auto.git
cd madness-auto
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
# Single account
PRIVATE_KEYS=your_private_key_here

# Multiple accounts (separate with commas, no spaces)
PRIVATE_KEYS=private_key1,private_key2,private_key3

# Example with 3 accounts:
# PRIVATE_KEYS=0x123...,0x456...,0x759..
```

4. Run the bot:
```bash
node index.js
```

## Features

- Auto checkin daily
- Auto swap MON to MAD
- Support multiple accounts
- Sequential processing with delay to avoid rate limiting
- Detailed logging for monitoring

## How It Works

1. The bot will process each account sequentially
2. For each account:
   - Perform daily checkin
   - Swap 0.1 MON to MAD
   - Update progress on chain
   - Claim reward
3. There is a 10-second delay between accounts to avoid rate limiting
4. Detailed logs will show the progress of each account

## Notes

- ⚠️ **IMPORTANT**: Each wallet must have minimum 0.12 MON (0.1 for swap + 0.02 for gas)
- The bot will skip accounts that have already checked in today
- For multiple accounts, add all private keys in the .env file separated by commas
- The bot will process accounts in the order they appear in the .env file
- If a wallet has insufficient balance, the bot will skip that account and continue with the next one

## Catatan

- Bot akan menampilkan status setiap langkah
- Jika sudah check-in hari ini, bot akan memberitahu
- ⚠️ **PENTING**: Setiap wallet harus memiliki minimal 0.12 MON (0.1 untuk swap + 0.02 untuk gas)
- Private key disimpan di file `.env` untuk keamanan
- Jika wallet tidak memiliki balance cukup, bot akan skip wallet tersebut dan lanjut ke wallet berikutnya

## Kontribusi

Silakan buat pull request untuk kontribusi. Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

## Lisensi

MIT 