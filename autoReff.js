const { ethers } = require('ethers');
const axios = require('axios');

// Configuration
const CONFIG = {
    REFERRAL_CODE: 'S7UZPO', // update your referral code here
    MADNESS_API: 'https://madness.finance/api',
    MONAD_RPC: 'https://testnet-rpc.monad.xyz/',
    API_KEY: 'madness-9w1dawd8a962d'
};

let isRunning = true;
let accountsCreated = 0;

// Handle Ctrl+C to stop the bot gracefully
process.on('SIGINT', () => {
    console.log('\nStopping bot...');
    isRunning = false;
});

// Function to create a new wallet
function createNewWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
}

// Function to connect to Monad network
async function connectToMonad(privateKey) {
    const provider = new ethers.JsonRpcProvider(CONFIG.MONAD_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

// Function to create account on Madness Finance
async function createMadnessAccount(address) {
    try {
        const response = await axios.post(`${CONFIG.MADNESS_API}/create`, {
            account: address,
            referredBy: CONFIG.REFERRAL_CODE
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating account:', error.message);
        return null;
    }
}

// Function to check profile
async function checkProfile(address) {
    try {
        const response = await axios.get(`${CONFIG.MADNESS_API}/profile`, {
            params: { account: address }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking profile:', error.message);
        return null;
    }
}

// Function to process a single account
async function processAccount() {
    try {
        // Create new wallet
        const wallet = createNewWallet();
        console.log(`\n[Account ${accountsCreated + 1}] Created new wallet:`, wallet.address);

        // Connect to Monad network
        const monadWallet = await connectToMonad(wallet.privateKey);
        console.log(`[Account ${accountsCreated + 1}] Connected to Monad network`);

        // Create account on Madness Finance
        const createResult = await createMadnessAccount(wallet.address);
        if (createResult) {
            console.log(`[Account ${accountsCreated + 1}] Account created successfully`);
            accountsCreated++;
        }

        // Check profile
        const profile = await checkProfile(wallet.address);
        if (profile) {
            console.log(`[Account ${accountsCreated}] Profile verified`);
        }

        // Save wallet details to file
        saveWalletDetails(wallet);

        return true;
    } catch (error) {
        console.error(`[Account ${accountsCreated + 1}] Error:`, error.message);
        return false;
    }
}

// Function to save wallet details to file
function saveWalletDetails(wallet) {
    const fs = require('fs');
    const details = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        timestamp: new Date().toISOString()
    };

    // Create wallets directory if it doesn't exist
    if (!fs.existsSync('wallets')) {
        fs.mkdirSync('wallets');
    }

    // Save to file
    fs.appendFileSync('wallets/created_wallets.txt', 
        `Address: ${details.address}\nPrivate Key: ${details.privateKey}\nTimestamp: ${details.timestamp}\n\n`);
}

// Main function to run the bot continuously
async function runBot() {
    console.log('Starting auto-referral bot...');
    console.log('Press Ctrl+C to stop the bot');
    console.log('----------------------------------------');

    while (isRunning) {
        await processAccount();
        
        // Add a small delay between account creation
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\nBot stopped');
    console.log(`Total accounts created: ${accountsCreated}`);
    console.log('Wallet details saved in wallets/created_wallets.txt');
}

// Run the bot
runBot().catch(error => {
    console.error('Fatal error:', error);
}); 