const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG = {
    PRIVATE_KEYS: process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [],
    MADNESS_API: 'https://madness.finance/api',
    MONAD_RPC: 'https://testnet-rpc.monad.xyz/',
    API_KEY: 'madness-9w1dawd8a962d',
    // Contract addresses
    ROUTER_ADDRESS: '0x64Aff7245EbdAAECAf266852139c67E4D8DBa4de',
    WMON_ADDRESS: '0x760afe86e5de5fa0ee542fc7b7b713e1c5425701',
    MAD_ADDRESS: '0xc8527e96c3cb9522f6e35e95c0a28feab8144f15',
    // Swap amount in MON
    SWAP_AMOUNT: ethers.parseEther('0.1'), // 0.1 MON
    // Liquidity amounts
    LIQUIDITY_MON: ethers.parseEther('0.12'), // 0.12 MON
    LIQUIDITY_MAD: ethers.parseEther('8.0') // 8 MAD
};

// Function to connect wallet using private key
async function connectWallet(privateKey) {
    try {
        console.log('🔄 Connecting to Monad network...');
        const provider = new ethers.JsonRpcProvider(CONFIG.MONAD_RPC);
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Verify connection by getting balance
        const balance = await provider.getBalance(wallet.address);
        console.log('✅ Wallet connected successfully!');
        console.log('📝 Wallet Address:', wallet.address);
        console.log('💰 Balance:', ethers.formatEther(balance), 'MON');
        
        return wallet;
    } catch (error) {
        console.error('❌ Error connecting wallet:', error.message);
        return null;
    }
}

// Function to get user profile
async function getUserProfile(address) {
    try {
        console.log('🔄 Getting user profile...');
        const response = await axios.get(`${CONFIG.MADNESS_API}/profile`, {
            params: { account: address }
        });
        console.log('✅ Profile retrieved successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error getting profile:', error.message);
        return null;
    }
}

// Function to check previous checkin status
async function checkPreviousCheckin(userId, taskId) {
    try {
        console.log('🔄 Checking previous checkin status...');
        const response = await axios.get(`${CONFIG.MADNESS_API}/progress`, {
            params: { 
                userId: userId,
                taskId: taskId
            }
        });
        
        if (response.data && response.data.data && response.data.data.completed) {
            const lastCheckin = new Date(response.data.data.lastCheckin);
            console.log('ℹ️ Last checkin was at:', lastCheckin.toLocaleString());
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Error checking previous checkin:', error.message);
        return false;
    }
}

// Function to perform checkin
async function performCheckin(userId, taskId) {
    try {
        console.log('🔄 Performing checkin...');
        const response = await axios.post(`${CONFIG.MADNESS_API}/progress`, {
            taskId: taskId,
            userId: userId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        console.log('✅ Checkin successful!');
        return response.data;
    } catch (error) {
        console.error('❌ Error performing checkin:', error.message);
        return null;
    }
}

// Function to perform swap MON to MAD
async function performSwap(wallet) {
    try {
        console.log('🔄 Preparing swap from MON to MAD...');
        
        // Get router contract
        const routerABI = [
            'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
        ];
        const router = new ethers.Contract(CONFIG.ROUTER_ADDRESS, routerABI, wallet);

        // Set path for swap (MON -> WMON -> MAD)
        const path = [CONFIG.WMON_ADDRESS, CONFIG.MAD_ADDRESS];
        
        // Get current block timestamp and add 20 minutes
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        
        // Set minimum amount out (80% of expected)
        const amountOutMin = ethers.parseEther('5.0'); // Minimum 5 MAD tokens

        console.log('📊 Swap Details:');
        console.log('From:', ethers.formatEther(CONFIG.SWAP_AMOUNT), 'MON');
        console.log('To: MAD (min 5 tokens)');
        console.log('Path:', path);
        console.log('Deadline:', new Date(deadline * 1000).toLocaleString());
        
        // Perform swap
        console.log('🔄 Executing swap...');
        const tx = await router.swapExactETHForTokens(
            amountOutMin,
            path,
            wallet.address,
            deadline,
            { 
                value: CONFIG.SWAP_AMOUNT,
                gasLimit: 300000 // Increased gas limit
            }
        );

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        
        if (receipt.status === 0) {
            throw new Error('Transaction reverted');
        }
        
        console.log('✅ Swap successful!');
        console.log('📝 Transaction Hash:', receipt.hash);
        console.log('💰 Gas Used:', ethers.formatEther(receipt.gasUsed), 'MON');
        
        return receipt;
    } catch (error) {
        console.error('❌ Error performing swap:', error.message);
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        if (error.transaction) {
            console.error('Transaction:', error.transaction);
        }
        return null;
    }
}

// Function to update progress on chain
async function updateProgressOnChain(userId, taskId, amount) {
    try {
        console.log('🔄 Updating progress on chain...');
        const response = await axios.post(`${CONFIG.MADNESS_API}/progressOnChain`, {
            taskId: taskId,
            userId: userId,
            amount: amount
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        console.log('✅ Progress updated successfully!');
        return response.data;
    } catch (error) {
        console.error('❌ Error updating progress:', error.message);
        return null;
    }
}

// Function to claim reward
async function claimReward(userId, taskId) {
    try {
        console.log('🔄 Claiming reward...');
        const response = await axios.post(`${CONFIG.MADNESS_API}/claim`, {
            userId: userId,
            taskId: taskId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.API_KEY
            }
        });
        console.log('✅ Reward claimed successfully!');
        return response.data;
    } catch (error) {
        console.error('❌ Error claiming reward:', error.message);
        return null;
    }
}

// Main function to run auto checkin and swap for a single account
async function runAccount(privateKey) {
    try {
        console.log('\n🚀 Starting process for new account...');
        
        // Step 1: Connect Wallet
        const wallet = await connectWallet(privateKey);
        if (!wallet) {
            console.error('❌ Failed to connect wallet, skipping account');
            return;
        }

        // Step 2: Get User Profile
        const profile = await getUserProfile(wallet.address);
        if (!profile || !profile.data || !profile.data.user) {
            console.error('❌ Failed to get user profile, skipping account');
            return;
        }
        const userId = profile.data.user._id;
        console.log('📋 User ID:', userId);
        console.log('👛 Wallet Address:', wallet.address);

        // Step 3: Check Previous Checkin
        const checkinTaskId = '67cab35dea568701db792ff1'; // Checkin task ID
        const hasCheckedIn = await checkPreviousCheckin(userId, checkinTaskId);
        
        if (hasCheckedIn) {
            console.log('⚠️ You have already checked in today!');
            return;
        }

        // Step 4: Perform Checkin
        const checkinResult = await performCheckin(userId, checkinTaskId);
        if (!checkinResult) {
            console.error('❌ Checkin failed, skipping account');
            return;
        }

        // Step 5: Perform Swap
        const swapTaskId = '67cab3f2ea568701db79306d'; // Swap task ID
        const swapResult = await performSwap(wallet);
        if (!swapResult) {
            console.error('❌ Swap failed, skipping account');
            return;
        }

        // Step 6: Update Progress On Chain
        const progressResult = await updateProgressOnChain(userId, swapTaskId, 0.1);
        if (!progressResult) {
            console.error('❌ Failed to update progress on chain');
            return;
        }

        // Step 7: Claim Reward
        const claimResult = await claimReward(userId, swapTaskId);
        if (!claimResult) {
            console.error('❌ Failed to claim reward');
            return;
        }

        console.log('✨ All processes completed successfully for this account!');
        console.log('1. ✅ Checkin completed');
        console.log('2. ✅ Swap completed');
        console.log('3. ✅ Progress updated on chain');
        console.log('4. ✅ Reward claimed');

    } catch (error) {
        console.error('❌ Error processing account:', error.message);
    }
}

// Main function to run all accounts
async function runAllAccounts() {
    try {
        if (!CONFIG.PRIVATE_KEYS || CONFIG.PRIVATE_KEYS.length === 0) {
            console.error('❌ No private keys found in .env file');
            return;
        }

        console.log(`📊 Found ${CONFIG.PRIVATE_KEYS.length} accounts to process`);
        
        // Process each account sequentially
        for (let i = 0; i < CONFIG.PRIVATE_KEYS.length; i++) {
            console.log(`\n🔄 Processing account ${i + 1} of ${CONFIG.PRIVATE_KEYS.length}`);
            await runAccount(CONFIG.PRIVATE_KEYS[i]);
            
            // Add delay between accounts to avoid rate limiting
            if (i < CONFIG.PRIVATE_KEYS.length - 1) {
                console.log('⏳ Waiting 10 seconds before processing next account...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }

        console.log('\n✨ All accounts processed!');
    } catch (error) {
        console.error('❌ Error in main process:', error.message);
    }
}

// Run all accounts
runAllAccounts(); 