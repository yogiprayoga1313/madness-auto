# Madness Finance Auto Bot

An automated bot for Madness Finance that performs:
1. Daily auto check-in
2. Auto swap MON to MAD token (0.1 MON)
3. Auto add liquidity to MON-MAD pool (0.1 MON + 8 MAD)

## Features

- Daily auto check-in
- Auto swap MON to MAD token
- Auto add liquidity to MON-MAD pool
- Previous check-in status notification
- Detailed transaction logging

## Requirements

- Node.js v16 or higher
- Monad wallet private key
- Sufficient MON balance (minimum 0.2 MON for swap and add liquidity)

## Installation

1. Clone repository:
```bash
git clone https://github.com/yogiprayoga1313/madness-reff.git
cd madness-reff
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and add your private key:
```bash
PRIVATE_KEY=your_private_key_here
```

## Usage

1. Ensure `.env` file contains your private key
2. Run the bot:
```bash
node index.js
```

The bot will automatically:
1. Connect to wallet
2. Check profile
3. Check previous check-in status
4. Perform MON to MAD swap (0.1 MON)
5. Approve MAD token for router
6. Add liquidity to pool (0.1 MON + 8 MAD)
7. Update progress on chain

## File Structure

- `index.js` - Main bot file
- `.env` - Configuration file (private key)
- `package.json` - Dependencies and scripts
- `.gitignore` - Git ignored files

## Notes

- Ensure wallet has sufficient MON for:
  - Swap (0.1 MON)
  - Add liquidity (0.1 MON)
  - Gas fees
- Bot will display status for each process
- If already checked in today, bot will notify
- Swap and add liquidity transaction hashes will be displayed

## License

MIT 